import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  AiAnalysisResult,
  AiResearchResult,
  CivicReportResult,
  ProblemContext,
} from '../ai.interface';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private client: any;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const groqKey = config?.get?.<string>('GROQ_API_KEY') || process.env.GROQ_API_KEY;
    const openAiKey = config?.get?.<string>('OPENAI_API_KEY') || process.env.OPENAI_API_KEY;
    const apiKey = groqKey || openAiKey;

    const defaultModel = groqKey ? 'qwen/qwen3.6-27b' : 'gpt-4o';
    this.model = config?.get?.<string>('AI_MODEL') || process.env.AI_MODEL || defaultModel;

    const baseURL =
      config?.get?.<string>('OPENAI_BASE_URL') ||
      process.env.OPENAI_BASE_URL ||
      (groqKey ? 'https://api.groq.com/openai/v1' : undefined);

    if (!apiKey) {
      this.logger.warn('⚠️  Neither GROQ_API_KEY nor OPENAI_API_KEY configured — AI features will be unavailable');
      return;
    }

    try {
      const { OpenAI } = require('openai');
      this.client = new OpenAI({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });
      this.logger.log(`✅ AI provider ready via ${groqKey ? 'Groq' : 'OpenAI'} (model: ${this.model})`);
    } catch {
      this.logger.error('Failed to initialize AI client');
    }
  }

  private async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.client) {
      throw new Error('AI service is not configured. Please set OPENAI_API_KEY.');
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return response.choices[0].message.content || '{}';
  }

  async analyzeEvidence(problem: ProblemContext): Promise<AiAnalysisResult> {
    const system = `You are Civora's AI verification engine. You analyze citizen-reported civic problems and provide structured assessments. Always respond with valid JSON matching the exact schema requested. Be honest — don't inflate confidence scores.`;

    const user = `Analyze this civic problem report:

Title: ${problem.title}
Description: ${problem.description || 'Not provided'}
Category: ${problem.category || 'Unknown'}
Problem Type: ${problem.problemType || 'Unknown'}
Location: ${problem.area || ''}, ${problem.city || 'Unknown'}
User Priority: ${problem.userPriority}
Attachments: ${problem.attachmentCount} file(s)

Respond with this exact JSON structure:
{
  "summary": "Brief 2-3 sentence summary of the reported issue",
  "severityAssessment": "Assessment of how severe this issue is and why",
  "priorityRecommendation": "low|medium|high|critical",
  "categoryValidation": "Is the category correct? Brief note",
  "evidenceAnalysis": "Analysis of the evidence quality and what it demonstrates",
  "duplicateFlag": false,
  "duplicateConfidence": 0,
  "missingInformation": ["list of missing info that would help"],
  "confidenceScore": 75,
  "recommendedAction": "What should be done next"
}`;

    const raw = await this.chat(system, user);
    const parsed = JSON.parse(raw);
    return parsed as AiAnalysisResult;
  }

  async researchProblem(problem: ProblemContext, analysis: AiAnalysisResult): Promise<AiResearchResult> {
    const system = `You are Civora's AI research engine. You provide evidence-based research on civic problems. Important: Only cite real information. Do not fabricate statistics or sources. If you don't have reliable information about something, say so clearly.`;

    const user = `Research this verified civic problem:

Title: ${problem.title}
Category: ${problem.category}
Location: ${problem.city}, ${problem.area || ''}
AI Summary: ${analysis.summary}
Severity: ${analysis.priorityRecommendation}

Provide research in this exact JSON structure:
{
  "backgroundInfo": "Background context about this type of civic problem",
  "possibleCauses": "Possible causes of this issue",
  "communityImpact": "How this affects the community",
  "relevantStatistics": "Any relevant statistics (note if approximate)",
  "similarIncidents": "Similar incidents in comparable cities/regions",
  "potentialSolutions": "Practical solutions and approaches",
  "responsibleAuthority": "Which government body or authority is responsible",
  "estimatedResolutionTime": "Realistic time estimate for resolution",
  "sources": [
    {
      "title": "Source title",
      "url": "URL if real, empty string if not available",
      "summary": "What this source covers",
      "relevanceScore": 85
    }
  ]
}`;

    const raw = await this.chat(system, user);
    return JSON.parse(raw) as AiResearchResult;
  }

  async generateCivicReport(problem: ProblemContext, research: AiResearchResult): Promise<CivicReportResult> {
    const system = `You are Civora's report generation AI. Create compelling, factual civic reports that motivate authorities to take action. Write professionally and with civic urgency. The report will be reviewed by a human admin before publishing.`;

    const user = `Generate a civic intelligence report for:

Title: ${problem.title}
Location: ${problem.city}
Category: ${problem.category}
Research: ${JSON.stringify(research, null, 2)}

Respond with this exact JSON:
{
  "overview": "Executive overview of the problem (2-3 paragraphs)",
  "whyItMatters": "Why this issue matters to the community",
  "researchFindings": "Key research findings summary",
  "severity": "Severity assessment",
  "recommendedAction": "Clear recommended action for authorities",
  "responsibleAuthority": "The specific authority that should act",
  "proposedPostContent": "Ready-to-publish social media post (engaging, civic tone, under 280 chars for Twitter compatibility)",
  "hashtags": ["CivicAction", "CiviOra", "relevant", "local", "hashtags"]
}`;

    const raw = await this.chat(system, user);
    return JSON.parse(raw) as CivicReportResult;
  }
}
