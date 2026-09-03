import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProblemDto {
  @IsUUID()
  categoryId: string;

  @IsUUID()
  typeId: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsOptional()
  userPriority?: 'low' | 'medium' | 'high' | 'critical' = 'medium';

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  area?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  cnic?: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}

export class UpdateProblemStatusDto {
  @IsEnum([
    'submitted', 'under_verification', 'ai_analysis', 'ai_research',
    'verified', 'rejected', 'awaiting_approval', 'approved',
    'publishing', 'published', 'in_progress', 'resolved', 'closed',
    'more_info_needed',
  ])
  status: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class AdminReviewDto {
  @IsEnum(['verify', 'reject', 'request_more_info', 'approve', 'change_priority'])
  action: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsOptional()
  priorityOverride?: 'low' | 'medium' | 'high' | 'critical';
}

export class UpdateCivicReportDto {
  @IsString()
  @IsOptional()
  overview?: string;

  @IsString()
  @IsOptional()
  whyItMatters?: string;

  @IsString()
  @IsOptional()
  researchFindings?: string;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  recommendedAction?: string;

  @IsString()
  @IsOptional()
  responsibleAuthority?: string;

  @IsString()
  @IsOptional()
  proposedPostContent?: string;
}

export class ListProblemsQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'priority';
}
