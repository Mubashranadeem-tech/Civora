import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import type { Database } from '@civora/db';
import {
  problems,
  problemLocations,
  problemAttachments,
  problemStatusHistory,
  problemCategories,
  problemTypes,
  users,
  aiAnalyses,
  aiResearchResults,
  researchSources,
  civicReports,
  adminReviews,
  notifications,
} from '@civora/db';
import { eq, desc, asc, and, ilike, inArray, sql, count } from 'drizzle-orm';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import {
  CreateProblemDto,
  UpdateProblemStatusDto,
  AdminReviewDto,
  ListProblemsQueryDto,
  UpdateCivicReportDto,
} from './problems.dto';

@Injectable()
export class ProblemsService {
  private readonly logger = new Logger(ProblemsService.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly storageService: StorageService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  // ─── Generate CIV ID ────────────────────────────────────────────────────────

  private async generateCivId(): Promise<string> {
    const year = new Date().getFullYear();
    const [result] = await this.db
      .select({ count: count() })
      .from(problems);
    const seq = (Number(result?.count || 0) + 1).toString().padStart(6, '0');
    return `CIV-${year}-${seq}`;
  }

  // ─── Create Problem ──────────────────────────────────────────────────────────

  async createProblem(
    userId: string,
    dto: CreateProblemDto,
    files: Array<Express.Multer.File>,
  ) {
    if (files.length > this.storageService.maxFiles) {
      throw new BadRequestException(`Maximum ${this.storageService.maxFiles} files allowed`);
    }

    const civId = await this.generateCivId();

    // Create problem
    const [problem] = await this.db
      .insert(problems)
      .values({
        civId,
        userId,
        categoryId: dto.categoryId,
        typeId: dto.typeId,
        title: dto.title,
        description: dto.description,
        userPriority: dto.userPriority,
        effectivePriority: dto.userPriority,
        status: 'submitted',
        attachmentCount: files.length,
      })
      .returning();

    // Save location
    await this.db.insert(problemLocations).values({
      problemId: problem.id,
      city: dto.city,
      area: dto.area,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    // Save status history
    await this.db.insert(problemStatusHistory).values({
      problemId: problem.id,
      fromStatus: null,
      toStatus: 'submitted',
      changedById: userId,
      notes: 'Problem submitted by citizen',
    });

    // Upload attachments
    if (files.length > 0) {
      const uploadResults = await Promise.all(
        files.map((file) =>
          this.storageService.uploadFile(
            {
              buffer: file.buffer,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
            },
            `problems/${problem.id}`,
          ),
        ),
      );

      await this.db.insert(problemAttachments).values(
        uploadResults.map((r, i) => ({
          problemId: problem.id,
          fileName: r.fileName,
          originalName: files[i].originalname,
          mimeType: files[i].mimetype,
          fileSize: files[i].size,
          storageKey: r.storageKey,
          storageUrl: r.url,
          attachmentType: r.attachmentType,
        })),
      );
    }

    // Update user problem count
    await this.db
      .update(users)
      .set({ problemsCount: sql`${users.problemsCount} + 1` })
      .where(eq(users.id, userId));

    // Get category and type names for email
    const [category] = await this.db
      .select({ name: problemCategories.name })
      .from(problemCategories)
      .where(eq(problemCategories.id, dto.categoryId));

    const [type] = await this.db
      .select({ name: problemTypes.name })
      .from(problemTypes)
      .where(eq(problemTypes.id, dto.typeId));

    const [user] = await this.db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId));

    // Send admin email (fire & forget)
    this.emailService
      .sendAdminNewProblemAlert({
        civId,
        title: dto.title,
        category: category?.name || 'Unknown',
        problemType: type?.name || 'Unknown',
        city: dto.city,
        priority: dto.userPriority,
        submittedBy: `${user?.name} (${user?.email})`,
        submittedAt: problem.createdAt,
        description: dto.description,
      })
      .catch((err) => this.logger.error('Admin email failed', err));

    this.logger.log(`✅ Problem created: ${civId}`);
    return { ...problem, civId };
  }

  // ─── List Problems ───────────────────────────────────────────────────────────

  async listProblems(userId: string, role: string, query: ListProblemsQueryDto) {
    const { page = 1, limit = 20, search, status, priority, categoryId, city, sortBy } = query;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    // Citizens can only see their own problems
    if (role !== 'admin') {
      conditions.push(eq(problems.userId, userId));
    }

    if (search) {
      conditions.push(ilike(problems.title, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(problems.status, status as any));
    }
    if (priority) {
      conditions.push(eq(problems.effectivePriority, priority as any));
    }
    if (categoryId) {
      conditions.push(eq(problems.categoryId, categoryId));
    }
    if (city) {
      conditions.push(ilike(problemLocations.city, `%${city}%`));
    }

    const priorityOrder = sql`CASE 
      WHEN ${problems.effectivePriority} = 'critical' THEN 1
      WHEN ${problems.effectivePriority} = 'high' THEN 2
      WHEN ${problems.effectivePriority} = 'medium' THEN 3
      WHEN ${problems.effectivePriority} = 'low' THEN 4
      ELSE 5 END`;

    const orderBy = sortBy === 'priority' 
      ? [asc(priorityOrder), desc(problems.createdAt)]
      : [desc(problems.createdAt)];

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalCount] = await Promise.all([
      this.db
        .select({
          id: problems.id,
          civId: problems.civId,
          title: problems.title,
          status: problems.status,
          userPriority: problems.userPriority,
          effectivePriority: problems.effectivePriority,
          attachmentCount: problems.attachmentCount,
          createdAt: problems.createdAt,
          categoryName: problemCategories.name,
          typeName: problemTypes.name,
          city: problemLocations.city,
          submitterName: users.name,
        })
        .from(problems)
        .leftJoin(problemCategories, eq(problems.categoryId, problemCategories.id))
        .leftJoin(problemTypes, eq(problems.typeId, problemTypes.id))
        .leftJoin(problemLocations, eq(problems.id, problemLocations.problemId))
        .leftJoin(users, eq(problems.userId, users.id))
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(problems)
        .leftJoin(problemLocations, eq(problems.id, problemLocations.problemId))
        .where(whereClause),
    ]);

    return {
      data: rows,
      pagination: {
        total: Number(totalCount[0]?.count || 0),
        page,
        limit,
        totalPages: Math.ceil(Number(totalCount[0]?.count || 0) / limit),
      },
    };
  }

  // ─── Get Problem Detail ──────────────────────────────────────────────────────

  async getProblemDetail(problemId: string, userId: string, role: string) {
    const [problem] = await this.db
      .select()
      .from(problems)
      .where(eq(problems.id, problemId))
      .limit(1);

    if (!problem) throw new NotFoundException(`Problem ${problemId} not found`);

    // Citizens can only see their own problems
    if (role !== 'admin' && problem.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const [location, attachments, history, aiAnalysis, research, report] = await Promise.all([
      this.db.select().from(problemLocations).where(eq(problemLocations.problemId, problemId)).limit(1),
      this.db.select().from(problemAttachments).where(eq(problemAttachments.problemId, problemId)),
      this.db
        .select({
          id: problemStatusHistory.id,
          fromStatus: problemStatusHistory.fromStatus,
          toStatus: problemStatusHistory.toStatus,
          notes: problemStatusHistory.notes,
          createdAt: problemStatusHistory.createdAt,
          changedByName: users.name,
        })
        .from(problemStatusHistory)
        .leftJoin(users, eq(problemStatusHistory.changedById, users.id))
        .where(eq(problemStatusHistory.problemId, problemId))
        .orderBy(asc(problemStatusHistory.createdAt)),
      this.db.select().from(aiAnalyses).where(eq(aiAnalyses.problemId, problemId)).limit(1),
      this.db.select().from(aiResearchResults).where(eq(aiResearchResults.problemId, problemId)).limit(1),
      this.db.select().from(civicReports).where(eq(civicReports.problemId, problemId)).limit(1),
    ]);

    const [category] = await this.db
      .select({ name: problemCategories.name, icon: problemCategories.icon, color: problemCategories.color })
      .from(problemCategories)
      .where(eq(problemCategories.id, problem.categoryId!))
      .limit(1);

    const [type] = await this.db
      .select({ name: problemTypes.name })
      .from(problemTypes)
      .where(eq(problemTypes.id, problem.typeId!))
      .limit(1);

    const [submitter] = await this.db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, problem.userId))
      .limit(1);

    // Add signed URLs to attachments
    const attachmentsWithUrls = await Promise.all(
      attachments.map(async (att) => ({
        ...att,
        signedUrl: await this.storageService.getSignedUrl(att.storageKey),
      })),
    );

    let sources: any[] = [];
    if (research[0]) {
      sources = await this.db
        .select()
        .from(researchSources)
        .where(eq(researchSources.researchId, research[0].id));
    }

    return {
      ...problem,
      category,
      type,
      submitter,
      location: location[0] || null,
      attachments: attachmentsWithUrls,
      statusHistory: history,
      aiAnalysis: aiAnalysis[0] || null,
      research: research[0] ? { ...research[0], sources } : null,
      civicReport: report[0] || null,
    };
  }

  // ─── Admin: Update Status ────────────────────────────────────────────────────

  async updateStatus(
    problemId: string,
    adminId: string,
    dto: UpdateProblemStatusDto,
  ) {
    const [problem] = await this.db
      .select({ status: problems.status, userId: problems.userId, civId: problems.civId, title: problems.title })
      .from(problems)
      .where(eq(problems.id, problemId))
      .limit(1);

    if (!problem) throw new NotFoundException('Problem not found');

    const fromStatus = problem.status;

    await this.db
      .update(problems)
      .set({ status: dto.status as any, updatedAt: new Date() })
      .where(eq(problems.id, problemId));

    await this.db.insert(problemStatusHistory).values({
      problemId,
      fromStatus: fromStatus as any,
      toStatus: dto.status as any,
      changedById: adminId,
      notes: dto.notes,
    });

    // Create notification for the user
    const statusMessages: Record<string, string> = {
      under_verification: 'Your problem is being reviewed by our team.',
      verified: 'Your problem report has been verified.',
      rejected: 'Your problem report could not be verified. See admin notes for details.',
      ai_analysis: 'Our AI is analyzing your problem report.',
      ai_research: 'Our AI is researching your civic issue in depth.',
      awaiting_approval: 'Your problem has completed research and is awaiting final approval.',
      approved: 'Your problem report has been approved and will be published.',
      published: 'Your problem has been published to relevant platforms.',
      in_progress: 'Your reported problem is now being addressed by relevant authorities.',
      resolved: 'Your reported problem has been resolved. Thank you for contributing!',
      more_info_needed: 'We need more information about your problem report. Please check your email.',
    };

    const message = statusMessages[dto.status] || `Status updated to ${dto.status}`;

    await this.db.insert(notifications).values({
      userId: problem.userId,
      problemId,
      type: 'status_change',
      title: `Problem ${problem.civId} Updated`,
      message,
    });

    return { success: true };
  }

  // ─── Admin Review ────────────────────────────────────────────────────────────

  async adminReview(problemId: string, adminId: string, dto: AdminReviewDto) {
    const [problem] = await this.db
      .select()
      .from(problems)
      .where(eq(problems.id, problemId))
      .limit(1);

    if (!problem) throw new NotFoundException('Problem not found');

    await this.db.insert(adminReviews).values({
      problemId,
      adminId,
      action: dto.action,
      notes: dto.notes,
      priorityOverride: dto.priorityOverride,
    });

    const statusMap: Record<string, string> = {
      verify: 'verified',
      reject: 'rejected',
      request_more_info: 'more_info_needed',
      approve: 'approved',
    };

    const newStatus = statusMap[dto.action];
    if (newStatus) {
      await this.db
        .update(problems)
        .set({
          status: newStatus as any,
          ...(dto.priorityOverride && {
            finalPriority: dto.priorityOverride,
            effectivePriority: dto.priorityOverride,
          }),
          ...(newStatus === 'verified' && { verifiedAt: new Date() }),
          updatedAt: new Date(),
        })
        .where(eq(problems.id, problemId));

      await this.db.insert(problemStatusHistory).values({
        problemId,
        fromStatus: problem.status as any,
        toStatus: newStatus as any,
        changedById: adminId,
        notes: dto.notes,
      });

      await this.db.insert(notifications).values({
        userId: problem.userId,
        problemId,
        type: 'status_change',
        title: `Problem ${problem.civId} Updated`,
        message: `Your problem has been ${newStatus}. ${dto.notes || ''}`,
      });
    }

    return { success: true };
  }

  // ─── Update Civic Report ─────────────────────────────────────────────────────

  async updateCivicReport(problemId: string, adminId: string, dto: UpdateCivicReportDto) {
    await this.db
      .update(civicReports)
      .set({
        ...dto,
        isAdminEdited: true,
        adminEditedAt: new Date(),
        adminEditedById: adminId,
        updatedAt: new Date(),
      })
      .where(eq(civicReports.problemId, problemId));

    return { success: true };
  }

  // ─── Track by CIV ID ─────────────────────────────────────────────────────────

  async trackByCivId(civId: string) {
    const [problem] = await this.db
      .select({
        id: problems.id,
        civId: problems.civId,
        title: problems.title,
        status: problems.status,
        effectivePriority: problems.effectivePriority,
        createdAt: problems.createdAt,
        verifiedAt: problems.verifiedAt,
        publishedAt: problems.publishedAt,
        resolvedAt: problems.resolvedAt,
        categoryName: problemCategories.name,
        typeName: problemTypes.name,
        city: problemLocations.city,
      })
      .from(problems)
      .leftJoin(problemCategories, eq(problems.categoryId, problemCategories.id))
      .leftJoin(problemTypes, eq(problems.typeId, problemTypes.id))
      .leftJoin(problemLocations, eq(problems.id, problemLocations.problemId))
      .where(eq(problems.civId, civId))
      .limit(1);

    if (!problem) throw new NotFoundException(`No problem found with ID: ${civId}`);

    const history = await this.db
      .select({
        id: problemStatusHistory.id,
        fromStatus: problemStatusHistory.fromStatus,
        toStatus: problemStatusHistory.toStatus,
        notes: problemStatusHistory.notes,
        createdAt: problemStatusHistory.createdAt,
      })
      .from(problemStatusHistory)
      .where(eq(problemStatusHistory.problemId, problem.id))
      .orderBy(asc(problemStatusHistory.createdAt));

    return { ...problem, statusHistory: history };
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────

  async getStats() {
    const [total, byStatus, byPriority] = await Promise.all([
      this.db.select({ count: count() }).from(problems),
      this.db
        .select({ status: problems.status, count: count() })
        .from(problems)
        .groupBy(problems.status),
      this.db
        .select({ priority: problems.effectivePriority, count: count() })
        .from(problems)
        .groupBy(problems.effectivePriority),
    ]);

    const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, Number(r.count)]));
    const priorityMap = Object.fromEntries(byPriority.map((r) => [r.priority, Number(r.count)]));

    return {
      total: Number(total[0]?.count || 0),
      byStatus: statusMap,
      byPriority: priorityMap,
      new: statusMap['submitted'] || 0,
      pending: (statusMap['under_verification'] || 0) + (statusMap['ai_analysis'] || 0) + (statusMap['ai_research'] || 0),
      verified: statusMap['verified'] || 0,
      published: statusMap['published'] || 0,
      resolved: statusMap['resolved'] || 0,
      critical: priorityMap['critical'] || 0,
    };
  }
}
