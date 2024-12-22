import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { SkipInterceptor } from '../common/decorators/skip-interceptor.decorator';

@Controller('health')
export class HealthController {
  constructor(private healthCheckService: HealthCheckService) {}

  @Get()
  @HealthCheck()
  @SkipInterceptor()
  check() {
    return this.healthCheckService.check([]);
  }
}
