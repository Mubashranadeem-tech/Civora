import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

function getEnvFallback(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../../.env'),
      path.resolve(process.cwd(), '../.env'),
      path.resolve(process.cwd(), 'apps/api/.env'),
    ];
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(new RegExp(`^${key}\\s*=\\s*(.*)$`));
          if (match && match[1]) {
            const val = match[1].trim().replace(/^["']|["']$/g, '');
            if (val) return val;
          }
        }
      }
    }
  } catch {}
  return undefined;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private initTransporter(): nodemailer.Transporter | null {
    const provider = this.config.get<string>('EMAIL_PROVIDER') || getEnvFallback('EMAIL_PROVIDER') || 'smtp';
    if (provider === 'smtp') {
      const user = this.config.get<string>('SMTP_USER') || getEnvFallback('SMTP_USER') || 'duamehmood2200@gmail.com';
      const pass = this.config.get<string>('SMTP_PASS') || getEnvFallback('SMTP_PASS') || 'owgimveaphjskzpn';

      if (user && pass) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { 
            user: user.trim(), 
            pass: pass.trim().replace(/\s+/g, '') 
          },
        });
        this.logger.log(`✅ Email service configured (Gmail SMTP: ${user})`);
        return this.transporter;
      }
    }
    return null;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.initTransporter();
    }

    const from = this.config.get<string>('SMTP_FROM') || getEnvFallback('SMTP_FROM') || 'Civora Alerts <duamehmood2200@gmail.com>';

    if (!this.transporter) {
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.log(`📧 EMAIL (console mode)`);
      this.logger.log(`To: ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);
      this.logger.log(`Content: ${options.text || '(HTML email)'}`);
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return true;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`✅ Real Email sent successfully to ${options.to}: ${options.subject}`);
      return true;
    } catch (err) {
      this.logger.error(`❌ Failed to send email to ${options.to}`, err);
      return false;
    }
  }

  async sendAdminNewProblemAlert(problem: {
    civId: string;
    title: string;
    category: string;
    problemType: string;
    city: string;
    priority: string;
    submittedBy: string;
    submittedAt: Date;
    description?: string;
  }): Promise<void> {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL_TO') || getEnvFallback('ADMIN_EMAIL_TO') || 'duamehmood2200@gmail.com';
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');

    const priorityColors: Record<string, string> = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#65a30d',
    };

    const priorityColor = priorityColors[problem.priority.toLowerCase()] || '#6b7280';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #1d6b8a 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
    .logo { color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .logo span { color: #38bdf8; }
    .subtitle { color: #94d2e8; font-size: 13px; margin-top: 4px; }
    .civ-id { display: inline-block; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 18px; padding: 8px 16px; border-radius: 8px; font-family: monospace; }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase; background: ${priorityColor}; }
    .field-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { color: #111827; font-size: 15px; font-weight: 500; }
    .field-row { margin-bottom: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1e3a5f, #1d6b8a); color: #fff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .footer { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">Civ<span>ora</span></div>
      <div class="subtitle">AI-Powered Civic Problem Reporting Platform</div>
    </div>
    <h2 style="color:#111827;margin:0 0 8px">New Problem Reported</h2>
    <p style="color:#6b7280;margin:0 0 20px">A citizen has submitted a new civic problem that requires your review.</p>
    <div class="field-row">
      <div class="civ-id">${problem.civId}</div>
      &nbsp;&nbsp;
      <span class="priority-badge">${problem.priority.toUpperCase()}</span>
    </div>
    <hr class="divider">
    <div class="field-row">
      <div class="field-label">Problem Title</div>
      <div class="field-value">${problem.title}</div>
    </div>
    <div class="field-row">
      <div class="field-label">Category</div>
      <div class="field-value">${problem.category} &rsaquo; ${problem.problemType}</div>
    </div>
    <div class="field-row">
      <div class="field-label">Location</div>
      <div class="field-value">${problem.city}</div>
    </div>
    <div class="field-row">
      <div class="field-label">Submitted By</div>
      <div class="field-value">${problem.submittedBy}</div>
    </div>
    <div class="field-row">
      <div class="field-label">Submitted At</div>
      <div class="field-value">${problem.submittedAt.toLocaleString('en-US', { timeZone: 'UTC' })} UTC</div>
    </div>
    ${problem.description ? `<div class="field-row"><div class="field-label">Description</div><div class="field-value" style="color:#374151">${problem.description.substring(0, 300)}${problem.description.length > 300 ? '...' : ''}</div></div>` : ''}
    <a href="${appUrl}/admin/problems" class="btn">View in Admin Dashboard</a>
    <div class="footer">
      This is an automated notification from Civora &middot; <a href="${appUrl}" style="color:#6b7280">civora.ai</a>
    </div>
  </div>
</body>
</html>`;

    await this.sendEmail({
      to: adminEmail,
      subject: `New Civic Problem Reported — ${problem.civId}`,
      html,
      text: `New problem: ${problem.civId} — ${problem.title}\nPriority: ${problem.priority}\nLocation: ${problem.city}\nSubmitted by: ${problem.submittedBy}`,
    });
  }

  async sendUserStatusUpdate(
    userEmail: string,
    userName: string,
    civId: string,
    problemTitle: string,
    newStatus: string,
    message: string,
  ): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');

    const statusLabels: Record<string, string> = {
      under_verification: 'Under Verification',
      ai_analysis: 'AI Analysis',
      ai_research: 'AI Research',
      verified: 'Verified ✅',
      rejected: 'Rejected',
      awaiting_approval: 'Awaiting Approval',
      approved: 'Approved ✅',
      published: 'Published 🌐',
      in_progress: 'In Progress',
      resolved: 'Resolved ✅',
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #1d6b8a 100%); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
    .logo { color: #fff; font-size: 28px; font-weight: 700; }
    .logo span { color: #38bdf8; }
    .civ-id { font-family: monospace; background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 6px; font-weight: 700; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1e3a5f, #1d6b8a); color: #fff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">Civ<span>ora</span></div>
    </div>
    <h2 style="color:#111827">Update on Your Problem Report</h2>
    <p>Hi ${userName},</p>
    <p>Your problem report <strong class="civ-id">${civId}</strong> — <em>${problemTitle}</em> — has been updated.</p>
    <p><strong>New Status:</strong> ${statusLabels[newStatus] || newStatus}</p>
    <p style="color:#374151">${message}</p>
    <a href="${appUrl}/dashboard/track?id=${civId}" class="btn">Track Your Problem</a>
    <div class="footer">Civora &middot; AI-Powered Civic Problem Reporting</div>
  </div>
</body>
</html>`;

    await this.sendEmail({
      to: userEmail,
      subject: `Update on ${civId} — ${statusLabels[newStatus] || newStatus}`,
      html,
      text: `Your problem ${civId} (${problemTitle}) status: ${statusLabels[newStatus] || newStatus}\n${message}`,
    });
  }
}
