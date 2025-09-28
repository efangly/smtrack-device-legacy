import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { JsonLogger } from '../logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new JsonLogger();
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof Error) {
      message = exception.message;
    }

    if (exception instanceof HttpException) {
      if (typeof exception.getResponse() === 'object') {
        message = exception.getResponse()['message'];
      } else {
        message = exception.getResponse().toString();
      }
    }
    if (status >= 500) {
      this.logger.logError(
        `HTTP ${status} Error`,
        exception instanceof Error ? exception : new Error(message),
        'AllExceptionsFilter',
        {
          status,
          path: ctx.getRequest()?.url,
          method: ctx.getRequest()?.method
        }
      );
    } else if (status >= 400 && status !== 401) {
      this.logger.logWarning(
        `HTTP ${status} Warning: ${message}`,
        'AllExceptionsFilter',
        {
          status,
          path: ctx.getRequest()?.url,
          method: ctx.getRequest()?.method
        }
      );
    }
    response.status(status).json({
      message: message,
      success: false,
      data: null,
      traceStack: process.env.NODE_ENV === 'development' && exception instanceof Error ? exception.stack : undefined,
    });
  }
}
