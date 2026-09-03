import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import type { Database } from '@civora/db';
import {
  aiAnalyses,
  aiResearchResults,
  researchSources,
  civicReports,
  problems,
  problemCategories,
  problemTypes,
  problemLocations,
} from '@civora/db';
import { eq } from 'drizzle-orm';
import { AiProvider, ProblemContext } from './ai.interface';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;
  private readonly isConfigured: boolean;

  constructor(
    private readonly config: ConfigService,
    @Inject(DATABASE_TOKEN) private readonly db: Database,
  ) {
    const groqKey = config?.get?.<string>('GROQ_API_KEY') || process.env.GROQ_API_KEY;
    const openAiKey = config?.get?.<string>('OPENAI_API_KEY') || process.env.OPENAI_API_KEY;
    const apiKey = groqKey || openAiKey;
    this.isConfigured = !!apiKey;
    this.provider = new OpenAiProvider(config);
  }

  private async buildProblemContext(problemId: string): Promise<ProblemContext> {
    const [problem] = await this.db
      .select({
        id: problems.id,
        civId: problems.civId,
        title: problems.title,
        description: problems.description,
        userPriority: problems.userPriority,
        attachmentCount: problems.attachmentCount,
        categoryName: problemCategories.name,
        typeName: problemTypes.name,
        city: problemLocations.city,
        area: problemLocations.area,
      })
      .from(problems)
      .leftJoin(problemCategories, eq(problems.categoryId, problemCategories.id))
      .leftJoin(problemTypes, eq(problems.typeId, problemTypes.id))
      .leftJoin(problemLocations, eq(problems.id, problemLocations.problemId))
      .where(eq(problems.id, problemId))
      .limit(1);

    if (!problem) throw new Error(`Problem ${problemId} not found`);

    return {
      id: problem.id,
      civId: problem.civId,
      title: problem.title,
      description: problem.description,
      category: problem.categoryName,
      problemType: problem.typeName,
      city: problem.city || undefined,
      area: problem.area || undefined,
      userPriority: problem.userPriority,
      attachmentCount: problem.attachmentCount,
    };
  }

  async analyzeProblem(problemId: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('AI not configured — skipping analysis');
      throw new Error('AI service not configured. Please set OPENAI_API_KEY in your environment.');
    }

    this.logger.log(`🤖 Starting AI analysis for problem: ${problemId}`);

    const context = await this.buildProblemContext(problemId);
    const result = await this.provider.analyzeEvidence(context);

    await this.db
      .insert(aiAnalyses)
      .values({
        problemId,
        provider: this.config.get<string>('AI_PROVIDER') || (process.env.GROQ_API_KEY ? 'groq' : 'openai'),
        model: this.config.get<string>('AI_MODEL') || this.config.get<string>('OPENAI_MODEL') || (process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gpt-4o'),
        summary: result.summary,
        severityAssessment: result.severityAssessment,
        priorityRecommendation: result.priorityRecommendation,
        categoryValidation: result.categoryValidation,
        evidenceAnalysis: result.evidenceAnalysis,
        duplicateFlag: result.duplicateFlag,
        duplicateConfidence: result.duplicateConfidence,
        missingInformation: result.missingInformation,
        confidenceScore: result.confidenceScore,
        recommendedAction: result.recommendedAction,
        completedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiAnalyses.problemId,
        set: {
          summary: result.summary,
          severityAssessment: result.severityAssessment,
          priorityRecommendation: result.priorityRecommendation,
          confidenceScore: result.confidenceScore,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    // Update AI priority on the problem
    await this.db
      .update(problems)
      .set({
        aiPriority: result.priorityRecommendation,
        effectivePriority: result.priorityRecommendation,
        status: 'ai_analysis',
        updatedAt: new Date(),
      })
      .where(eq(problems.id, problemId));

    this.logger.log(`✅ AI analysis complete for: ${problemId}`);
  }

  async researchProblem(problemId: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('AI service not configured. Please set OPENAI_API_KEY in your environment.');
    }

    this.logger.log(`🔬 Starting AI research for problem: ${problemId}`);

    const context = await this.buildProblemContext(problemId);

    // Get the analysis
    const [analysis] = await this.db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.problemId, problemId))
      .limit(1);

    if (!analysis) {
      throw new Error('AI analysis must be completed before research');
    }

    const researchResult = await this.provider.researchProblem(context, {
      summary: analysis.summary || '',
      severityAssessment: analysis.severityAssessment || '',
      priorityRecommendation: (analysis.priorityRecommendation as any) || 'medium',
      categoryValidation: analysis.categoryValidation || '',
      evidenceAnalysis: analysis.evidenceAnalysis || '',
      duplicateFlag: analysis.duplicateFlag,
      duplicateConfidence: analysis.duplicateConfidence || 0,
      missingInformation: (analysis.missingInformation as string[]) || [],
      confidenceScore: analysis.confidenceScore || 0,
      recommendedAction: analysis.recommendedAction || '',
    });

    // Save research
    const [savedResearch] = await this.db
      .insert(aiResearchResults)
      .values({
        problemId,
        backgroundInfo: researchResult.backgroundInfo,
        possibleCauses: researchResult.possibleCauses,
        communityImpact: researchResult.communityImpact,
        relevantStatistics: researchResult.relevantStatistics,
        similarIncidents: researchResult.similarIncidents,
        potentialSolutions: researchResult.potentialSolutions,
        responsibleAuthority: researchResult.responsibleAuthority,
        estimatedResolutionTime: researchResult.estimatedResolutionTime,
        completedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiResearchResults.problemId,
        set: {
          backgroundInfo: researchResult.backgroundInfo,
          possibleCauses: researchResult.possibleCauses,
          communityImpact: researchResult.communityImpact,
          relevantStatistics: researchResult.relevantStatistics,
          similarIncidents: researchResult.similarIncidents,
          potentialSolutions: researchResult.potentialSolutions,
          responsibleAuthority: researchResult.responsibleAuthority,
          estimatedResolutionTime: researchResult.estimatedResolutionTime,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    // Clean and save sources
    if (savedResearch?.id) {
      await this.db.delete(researchSources).where(eq(researchSources.researchId, savedResearch.id));
      if (researchResult.sources?.length > 0) {
        await this.db.insert(researchSources).values(
          researchResult.sources.map((s) => ({
            researchId: savedResearch.id,
            title: s.title,
            url: s.url || null,
            summary: s.summary,
            relevanceScore: s.relevanceScore,
          })),
        );
      }
    }

    // Generate civic report
    const reportResult = await this.provider.generateCivicReport(context, researchResult);

    await this.db
      .insert(civicReports)
      .values({
        problemId,
        overview: reportResult.overview,
        whyItMatters: reportResult.whyItMatters,
        researchFindings: reportResult.researchFindings,
        severity: reportResult.severity,
        recommendedAction: reportResult.recommendedAction,
        responsibleAuthority: reportResult.responsibleAuthority,
        proposedPostContent: reportResult.proposedPostContent,
        hashtags: reportResult.hashtags,
      })
      .onConflictDoUpdate({
        target: civicReports.problemId,
        set: {
          overview: reportResult.overview,
          whyItMatters: reportResult.whyItMatters,
          researchFindings: reportResult.researchFindings,
          severity: reportResult.severity,
          recommendedAction: reportResult.recommendedAction,
          responsibleAuthority: reportResult.responsibleAuthority,
          proposedPostContent: reportResult.proposedPostContent,
          hashtags: reportResult.hashtags,
          updatedAt: new Date(),
        },
      });

    // Update status
    await this.db
      .update(problems)
      .set({ status: 'awaiting_approval', updatedAt: new Date() })
      .where(eq(problems.id, problemId));

    this.logger.log(`✅ AI research complete for: ${problemId}`);
  }

  getConfigStatus(): { provider: string; isConfigured: boolean } {
    return {
      provider: this.config.get<string>('AI_PROVIDER', 'openai'),
      isConfigured: this.isConfigured,
    };
  }
}
