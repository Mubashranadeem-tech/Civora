import { Controller, Post, Param, UseGuards, Request, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @UseGuards(AdminGuard)
  getStatus() {
    return this.aiService.getConfigStatus();
  }

  @Post('problems/:id/analyze')
  @UseGuards(AdminGuard)
  async analyze(@Param('id') id: string) {
    try {
      await this.aiService.analyzeProblem(id);
      return { success: true, message: 'AI analysis completed' };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to complete AI analysis',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('problems/:id/research')
  @UseGuards(AdminGuard)
  async research(@Param('id') id: string) {
    try {
      await this.aiService.researchProblem(id);
      return { success: true, message: 'AI research completed' };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to complete AI research',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
