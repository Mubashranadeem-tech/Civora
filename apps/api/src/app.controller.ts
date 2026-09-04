import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'online',
      name: 'Civora Civic Intelligence API',
      version: '1.0.0',
      description: 'AI-Powered Civic Problem Reporting & Automated Resolution Platform',
      endpoints: '/api/v1',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
