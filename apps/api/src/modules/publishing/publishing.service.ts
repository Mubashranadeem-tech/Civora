import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import type { Database } from '@civora/db';
import {
  publishingJobs,
  publishingResults,
  problems,
  civicReports,
} from '@civora/db';
import { eq } from 'drizzle-orm';
import {
  LinkedInAdapter,
  TwitterAdapter,
  WordPressAdapter,
  WebhookAdapter,
} from './publishing.adapters';

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);
  private readonly adapters: Record<string, any>;

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly config: ConfigService,
  ) {
    this.adapters = {
      linkedin: new LinkedInAdapter(config),
      twitter: new TwitterAdapter(config),
      wordpress: new WordPressAdapter(config),
      webhook: new WebhookAdapter(config),
    };
  }

  getConfiguredPlatforms(): string[] {
    return Object.entries(this.adapters)
      .filter(([, adapter]) => adapter.isConfigured())
      .map(([name]) => name);
  }

  getPlatformStatus(): Record<string, boolean> {
    return Object.fromEntries(
      Object.entries(this.adapters).map(([name, adapter]) => [
        name,
        adapter.isConfigured(),
      ]),
    );
  }

  async publishProblem(problemId: string, adminId: string, platforms?: string[]) {
    const configured = this.getConfiguredPlatforms();

    if (configured.length === 0 && !platforms?.length) {
      throw new Error(
        'No publishing platforms configured. Set platform credentials in .env to enable publishing.',
      );
    }

    const targetPlatforms = platforms || configured;

    // Get civic report
    const [report] = await this.db
      .select()
      .from(civicReports)
      .where(eq(civicReports.problemId, problemId))
      .limit(1);

    if (!report) {
      throw new Error('No civic report found. Run AI research first.');
    }

    const content = report.proposedPostContent || report.overview || 'Civic issue reported via Civora';

    // Create publishing job
    const [job] = await this.db
      .insert(publishingJobs)
      .values({
        problemId,
        triggeredById: adminId,
        platforms: targetPlatforms,
        status: 'publishing',
        startedAt: new Date(),
      })
      .returning();

    let allSucceeded = true;
    const publishedUrls: string[] = [];

    // Publish to each platform
    for (const platform of targetPlatforms) {
      const adapter = this.adapters[platform];

      if (!adapter) {
        await this.db.insert(publishingResults).values({
          jobId: job.id,
          problemId,
          platform: platform as any,
          status: 'skipped',
          errorMessage: 'Platform adapter not found',
        });
        continue;
      }

      if (!adapter.isConfigured()) {
        await this.db.insert(publishingResults).values({
          jobId: job.id,
          problemId,
          platform: platform as any,
          status: 'skipped',
          errorMessage: `Platform ${platform} is not configured. Add credentials to .env`,
        });
        continue;
      }

      try {
        const result = await adapter.publish(content);

        await this.db.insert(publishingResults).values({
          jobId: job.id,
          problemId,
          platform: platform as any,
          status: 'published',
          publishedUrl: result.url,
          publishedAt: new Date(),
        });

        publishedUrls.push(result.url);
        this.logger.log(`✅ Published to ${platform}: ${result.url}`);
      } catch (err: any) {
        allSucceeded = false;
        await this.db.insert(publishingResults).values({
          jobId: job.id,
          problemId,
          platform: platform as any,
          status: 'failed',
          errorMessage: err.message,
        });
        this.logger.error(`❌ Failed to publish to ${platform}`, err.message);
      }
    }

    // Update job status
    await this.db
      .update(publishingJobs)
      .set({
        status: allSucceeded ? 'published' : 'failed',
        completedAt: new Date(),
      })
      .where(eq(publishingJobs.id, job.id));

    // Update problem
    if (publishedUrls.length > 0) {
      await this.db
        .update(problems)
        .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(problems.id, problemId));
    }

    return { jobId: job.id, platforms: targetPlatforms, publishedUrls };
  }

  async getPublishingResults(problemId: string) {
    return this.db
      .select()
      .from(publishingResults)
      .where(eq(publishingResults.problemId, problemId));
  }

  async retryFailedPublications(jobId: string, adminId: string) {
    const results = await this.db
      .select()
      .from(publishingResults)
      .where(eq(publishingResults.jobId, jobId));

    const failed = results.filter((r) => r.status === 'failed');
    if (failed.length === 0) return { message: 'No failed publications to retry' };

    const problemId = failed[0].problemId;

    for (const result of failed) {
      const adapter = this.adapters[result.platform];
      if (!adapter?.isConfigured()) continue;

      try {
        const [report] = await this.db
          .select()
          .from(civicReports)
          .where(eq(civicReports.problemId, problemId))
          .limit(1);

        const content = report?.proposedPostContent || 'Civic issue reported via Civora';
        const published = await adapter.publish(content);

        await this.db
          .update(publishingResults)
          .set({
            status: 'published',
            publishedUrl: published.url,
            publishedAt: new Date(),
            retryCount: result.retryCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(publishingResults.id, result.id));
      } catch (err: any) {
        await this.db
          .update(publishingResults)
          .set({
            errorMessage: err.message,
            retryCount: result.retryCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(publishingResults.id, result.id));
      }
    }

    return { success: true };
  }
}
