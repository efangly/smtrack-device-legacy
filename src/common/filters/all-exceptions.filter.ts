import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
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
    if (status !== 401) this.logger.error(`Http Status: ${status} Error Message: ${message}`);
    response.status(status).json({
      message: message,
      success: false,
      data: null,
      traceStack: process.env.NODE_ENV === 'development' && exception instanceof Error ? exception.stack : undefined,
    });
  }
}
