import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PublishingService } from './publishing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { IsArray, IsOptional, IsString } from 'class-validator';

class PublishDto {
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  platforms?: string[];
}

@Controller('publishing')
@UseGuards(JwtAuthGuard, AdminGuard)
export class PublishingController {
  constructor(private readonly publishingService: PublishingService) {}

  @Get('status')
  getPlatformStatus() {
    return {
      platforms: this.publishingService.getPlatformStatus(),
      configured: this.publishingService.getConfiguredPlatforms(),
    };
  }

  @Post('problems/:id/publish')
  async publish(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: PublishDto,
  ) {
    return this.publishingService.publishProblem(id, req.user.sub, dto.platforms);
  }

  @Get('problems/:id/results')
  async getResults(@Param('id') id: string) {
    return this.publishingService.getPublishingResults(id);
  }

  @Post('jobs/:jobId/retry')
  async retry(@Request() req: any, @Param('jobId') jobId: string) {
    return this.publishingService.retryFailedPublications(jobId, req.user.sub);
  }
}
