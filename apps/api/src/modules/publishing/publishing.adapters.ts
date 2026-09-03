import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PublishingAdapter {
  isConfigured(): boolean;
  publish(content: string, imageUrl?: string): Promise<{ url: string }>;
}

@Injectable()
export class LinkedInAdapter implements PublishingAdapter {
  private readonly logger = new Logger('LinkedInAdapter');
  private readonly accessToken: string | undefined;
  private readonly orgId: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.accessToken = config?.get?.<string>('LINKEDIN_ACCESS_TOKEN') || process.env.LINKEDIN_ACCESS_TOKEN;
    this.orgId = config?.get?.<string>('LINKEDIN_ORGANIZATION_ID') || process.env.LINKEDIN_ORGANIZATION_ID;
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.orgId);
  }

  async publish(content: string): Promise<{ url: string }> {
    if (!this.isConfigured()) {
      throw new Error('LinkedIn not configured. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORGANIZATION_ID');
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:organization:${this.orgId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`LinkedIn publish failed: ${err}`);
    }

    const data = await response.json() as any;
    this.logger.log(`LinkedIn post published: ${data.id}`);
    return { url: `https://www.linkedin.com/feed/update/${data.id}` };
  }
}

@Injectable()
export class TwitterAdapter implements PublishingAdapter {
  private readonly logger = new Logger('TwitterAdapter');
  private client: any;

  constructor(private readonly config: ConfigService) {
    const apiKey = config?.get?.<string>('TWITTER_API_KEY') || process.env.TWITTER_API_KEY;
    const apiSecret = config?.get?.<string>('TWITTER_API_SECRET') || process.env.TWITTER_API_SECRET;
    const accessToken = config?.get?.<string>('TWITTER_ACCESS_TOKEN') || process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = config?.get?.<string>('TWITTER_ACCESS_TOKEN_SECRET') || process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (apiKey && apiSecret && accessToken && accessSecret) {
      try {
        const { TwitterApi } = require('twitter-api-v2');
        this.client = new TwitterApi({
          appKey: apiKey,
          appSecret: apiSecret,
          accessToken,
          accessSecret,
        });
      } catch {
        this.logger.warn('twitter-api-v2 package not installed');
      }
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  async publish(content: string): Promise<{ url: string }> {
    if (!this.isConfigured()) {
      throw new Error('Twitter/X not configured. Set TWITTER_* environment variables');
    }
    const tweet = await this.client.v2.tweet(content.substring(0, 280));
    return { url: `https://twitter.com/i/web/status/${tweet.data.id}` };
  }
}

@Injectable()
export class WordPressAdapter implements PublishingAdapter {
  private readonly logger = new Logger('WordPressAdapter');
  private readonly wpUrl: string | undefined;
  private readonly wpUser: string | undefined;
  private readonly wpPass: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.wpUrl = config?.get?.<string>('WORDPRESS_URL') || process.env.WORDPRESS_URL;
    this.wpUser = config?.get?.<string>('WORDPRESS_USERNAME') || process.env.WORDPRESS_USERNAME;
    this.wpPass = config?.get?.<string>('WORDPRESS_APP_PASSWORD') || process.env.WORDPRESS_APP_PASSWORD;
  }

  isConfigured(): boolean {
    return !!(this.wpUrl && (this.wpPass || this.wpUser));
  }

  async publish(content: string): Promise<{ url: string }> {
    if (!this.isConfigured()) {
      throw new Error('WordPress not configured. Set WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD');
    }

    const [title, ...rest] = content.split('\n');
    const cleanTitle = (title || 'Civic Problem Report').replace(/^#+\s*/, '').trim();
    const cleanContent = rest.join('\n').trim() || content;

    const auth = Buffer.from(`${this.wpUser || ''}:${this.wpPass || ''}`).toString('base64');
    let endpoint = this.wpUrl!.replace(/\/+$/, '');

    const headers: Record<string, string> = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    let body: any;

    if (endpoint.includes('public-api.wordpress.com')) {
      // WordPress.com REST API
      endpoint = `${endpoint}/posts/new`;
      body = {
        title: cleanTitle,
        content: cleanContent.replace(/\n/g, '<br/>'),
        status: 'publish',
      };
    } else {
      // Self-Hosted / Standard WordPress REST API
      if (!endpoint.includes('/wp-json')) {
        endpoint = `${endpoint}/wp-json/wp/v2/posts`;
      }
      body = {
        title: cleanTitle,
        content: cleanContent.replace(/\n/g, '<br/>'),
        status: 'publish',
      };
    }

    this.logger.log(`Publishing civic report to WordPress: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      this.logger.error(`WordPress publishing failed: ${err}`);
      throw new Error(`WordPress publish failed: ${err}`);
    }

    const data = (await response.json()) as any;
    const publishedUrl = data.URL || data.link || data.short_URL || this.wpUrl;
    this.logger.log(`✅ Successfully published to WordPress: ${publishedUrl}`);
    return { url: publishedUrl };
  }
}

@Injectable()
export class WebhookAdapter implements PublishingAdapter {
  private readonly logger = new Logger('WebhookAdapter');
  private readonly webhookUrl: string | undefined;
  private readonly webhookSecret: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.webhookUrl = config?.get?.<string>('WEBHOOK_URL') || process.env.WEBHOOK_URL;
    this.webhookSecret = config?.get?.<string>('WEBHOOK_SECRET') || process.env.WEBHOOK_SECRET;
  }

  isConfigured(): boolean {
    return !!this.webhookUrl;
  }

  async publish(content: string): Promise<{ url: string }> {
    if (!this.isConfigured()) {
      throw new Error('Webhook not configured. Set WEBHOOK_URL');
    }

    const response = await fetch(this.webhookUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.webhookSecret ? { 'X-Civora-Signature': this.webhookSecret } : {}),
      },
      body: JSON.stringify({
        source: 'Civora Civic Platform',
        timestamp: new Date().toISOString(),
        payload: { content },
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return { url: this.webhookUrl! };
  }
}
