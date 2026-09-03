import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProblemsService } from './problems.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  CreateProblemDto,
  UpdateProblemStatusDto,
  AdminReviewDto,
  ListProblemsQueryDto,
  UpdateCivicReportDto,
} from './problems.dto';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  // ─── Public Tracking ─────────────────────────────────────────────────────────
  @Get('track/:civId')
  async track(@Param('civId') civId: string) {
    return this.problemsService.trackByCivId(civId);
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats() {
    return this.problemsService.getStats();
  }

  // ─── Authenticated ────────────────────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() dto: CreateProblemDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.problemsService.createProblem(req.user.sub, dto, files || []);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Request() req: any, @Query() query: ListProblemsQueryDto) {
    return this.problemsService.listProblems(req.user.sub, req.user.role, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDetail(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.problemsService.getProblemDetail(id, req.user.sub, req.user.role);
  }

  // ─── Admin Only ───────────────────────────────────────────────────────────────
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProblemStatusDto,
  ) {
    return this.problemsService.updateStatus(id, req.user.sub, dto);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async adminReview(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.problemsService.adminReview(id, req.user.sub, dto);
  }

  @Patch(':id/civic-report')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateCivicReport(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCivicReportDto,
  ) {
    return this.problemsService.updateCivicReport(id, req.user.sub, dto);
  }
}
