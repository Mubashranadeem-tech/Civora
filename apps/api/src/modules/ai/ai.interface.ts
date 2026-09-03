export interface AiAnalysisResult {
  summary: string;
  severityAssessment: string;
  priorityRecommendation: 'low' | 'medium' | 'high' | 'critical';
  categoryValidation: string;
  evidenceAnalysis: string;
  duplicateFlag: boolean;
  duplicateConfidence: number;
  missingInformation: string[];
  confidenceScore: number;
  recommendedAction: string;
}

export interface AiResearchResult {
  backgroundInfo: string;
  possibleCauses: string;
  communityImpact: string;
  relevantStatistics: string;
  similarIncidents: string;
  potentialSolutions: string;
  responsibleAuthority: string;
  estimatedResolutionTime: string;
  sources: Array<{ title: string; url: string; summary: string; relevanceScore: number }>;
}

export interface CivicReportResult {
  overview: string;
  whyItMatters: string;
  researchFindings: string;
  severity: string;
  recommendedAction: string;
  responsibleAuthority: string;
  proposedPostContent: string;
  hashtags: string[];
}

export interface ProblemContext {
  id: string;
  civId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  problemType?: string | null;
  city?: string;
  area?: string;
  userPriority: string;
  attachmentCount?: number;
}

export interface AiProvider {
  analyzeEvidence(problem: ProblemContext): Promise<AiAnalysisResult>;
  researchProblem(problem: ProblemContext, analysis: AiAnalysisResult): Promise<AiResearchResult>;
  generateCivicReport(problem: ProblemContext, research: AiResearchResult): Promise<CivicReportResult>;
}
