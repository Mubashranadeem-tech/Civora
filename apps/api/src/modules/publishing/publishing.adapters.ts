import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

function getEnvFallback(key: string): string | undefined {
  try {
    const envPaths = [
      path.resolve(process.cwd(), 'apps/api/.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../.env'),
      path.resolve(process.cwd(), '../../.env'),
    ];
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#')) continue;
          const match = trimmed.match(new RegExp(`^${key}\\s*=\\s*(.*)$`));
          if (match && match[1]) {
            const val = match[1].trim().replace(/^["']|["']$/g, '');
            if (val) return val;
          }
        }
      }
    }
  } catch {}
  return process.env[key] || undefined;
}

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

    let endpoint = this.wpUrl!.replace(/\/+$/, '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let body: any;

    if (endpoint.includes('public-api.wordpress.com')) {
      // WordPress.com REST API uses Bearer token authentication
      headers['Authorization'] = `Bearer ${this.wpPass}`;
      endpoint = `${endpoint}/posts/new`;
      body = {
        title: cleanTitle,
        content: cleanContent.replace(/\n/g, '<br/>'),
        status: 'publish',
      };
    } else {
      // Self-Hosted / Standard WordPress REST API uses Basic auth with Application Password
      const auth = Buffer.from(`${this.wpUser || ''}:${this.wpPass || ''}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
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
    const url = this.config?.get?.<string>('WEBHOOK_URL') || process.env.WEBHOOK_URL || getEnvFallback('WEBHOOK_URL') || this.webhookUrl;
    return !!url && url.trim().length > 0;
  }

  async publish(content: string): Promise<{ url: string }> {
    const url = this.config?.get?.<string>('WEBHOOK_URL') || process.env.WEBHOOK_URL || getEnvFallback('WEBHOOK_URL') || this.webhookUrl;
    const secret = this.config?.get?.<string>('WEBHOOK_SECRET') || process.env.WEBHOOK_SECRET || getEnvFallback('WEBHOOK_SECRET') || this.webhookSecret;

    if (!this.isConfigured() || !url) {
      throw new Error('Webhook not configured. Set WEBHOOK_URL');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'X-Civora-Signature': secret } : {}),
      },
      body: JSON.stringify({
        source: 'Civora Autonomous Intelligence',
        timestamp: new Date().toISOString(),
        payload: content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return { url };
  }
}

@Injectable()
export class FacebookAdapter implements PublishingAdapter {
  private readonly logger = new Logger('FacebookAdapter');
  private readonly appId: string | undefined;
  private readonly appSecret: string | undefined;
  private readonly pageId: string | undefined;
  private readonly pageAccessToken: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.appId = config?.get?.<string>('FACEBOOK_APP_ID') || process.env.FACEBOOK_APP_ID || getEnvFallback('FACEBOOK_APP_ID');
    this.appSecret = config?.get?.<string>('FACEBOOK_APP_SECRET') || process.env.FACEBOOK_APP_SECRET || getEnvFallback('FACEBOOK_APP_SECRET');
    this.pageId = config?.get?.<string>('FACEBOOK_PAGE_ID') || process.env.FACEBOOK_PAGE_ID || getEnvFallback('FACEBOOK_PAGE_ID');
    this.pageAccessToken =
      config?.get?.<string>('FACEBOOK_PAGE_ACCESS_TOKEN') ||
      config?.get?.<string>('FACEBOOK_ACCESS_TOKEN') ||
      getEnvFallback('FACEBOOK_PAGE_ACCESS_TOKEN') ||
      getEnvFallback('FACEBOOK_ACCESS_TOKEN') ||
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
      process.env.FACEBOOK_ACCESS_TOKEN;
  }

  isConfigured(): boolean {
    const appId = this.config?.get?.<string>('FACEBOOK_APP_ID') || getEnvFallback('FACEBOOK_APP_ID') || process.env.FACEBOOK_APP_ID || this.appId;
    const appSecret = this.config?.get?.<string>('FACEBOOK_APP_SECRET') || getEnvFallback('FACEBOOK_APP_SECRET') || process.env.FACEBOOK_APP_SECRET || this.appSecret;
    const pageToken =
      this.config?.get?.<string>('FACEBOOK_PAGE_ACCESS_TOKEN') ||
      this.config?.get?.<string>('FACEBOOK_ACCESS_TOKEN') ||
      getEnvFallback('FACEBOOK_PAGE_ACCESS_TOKEN') ||
      getEnvFallback('FACEBOOK_ACCESS_TOKEN') ||
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
      process.env.FACEBOOK_ACCESS_TOKEN ||
      this.pageAccessToken;

    return !!(pageToken || (appId && appSecret));
  }

  async publish(content: string): Promise<{ url: string }> {
    const appId = this.config?.get?.<string>('FACEBOOK_APP_ID') || getEnvFallback('FACEBOOK_APP_ID') || process.env.FACEBOOK_APP_ID || this.appId;
    const appSecret = this.config?.get?.<string>('FACEBOOK_APP_SECRET') || getEnvFallback('FACEBOOK_APP_SECRET') || process.env.FACEBOOK_APP_SECRET || this.appSecret;
    const pageId = getEnvFallback('FACEBOOK_PAGE_ID') || this.config?.get?.<string>('FACEBOOK_PAGE_ID') || process.env.FACEBOOK_PAGE_ID || this.pageId || 'me';
    let token =
      getEnvFallback('FACEBOOK_PAGE_ACCESS_TOKEN') ||
      getEnvFallback('FACEBOOK_ACCESS_TOKEN') ||
      this.config?.get?.<string>('FACEBOOK_PAGE_ACCESS_TOKEN') ||
      this.config?.get?.<string>('FACEBOOK_ACCESS_TOKEN') ||
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
      process.env.FACEBOOK_ACCESS_TOKEN ||
      this.pageAccessToken;

    if (!token && appId && appSecret) {
      token = `${appId}|${appSecret}`;
    }

    if (!token) {
      throw new Error('Facebook not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET or FACEBOOK_PAGE_ACCESS_TOKEN.');
    }

    // If the token is a User Access Token, attempt to resolve the Page Access Token
    if (token && pageId && pageId !== 'me') {
      try {
        const pageRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${token}`);
        if (pageRes.ok) {
          const pageData = await pageRes.json() as any;
          if (pageData?.access_token) {
            token = pageData.access_token;
          }
        }
      } catch {}
    }

    this.logger.log(`Publishing civic update to Facebook Graph API (Target: ${pageId})...`);

    const endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        access_token: token,
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok || data.error) {
      const errMsg = data?.error?.message || response.statusText || 'Facebook Graph API error';
      this.logger.error(`Facebook publish failed: ${errMsg}`);
      throw new Error(`Facebook publish failed: ${errMsg}`);
    }

    const postId = data.id;
    const publishedUrl = `https://www.facebook.com/${postId}`;
    this.logger.log(`✅ Successfully published to Facebook: ${publishedUrl}`);
    return { url: publishedUrl };
  }
}

