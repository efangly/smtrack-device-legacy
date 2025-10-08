import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

    if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          message = `${exception.code}: The value for field '${exception.meta?.target}' already exists`;
          status = HttpStatus.CONFLICT;
          break;
        case 'P2003':
          message = `${exception.code}: Foreign key constraint failed`;
          status = HttpStatus.BAD_REQUEST;
          break;
        case 'P2024': // Record not found
          message = `${exception.code}: Timed out fetching a new connection from the connection pool`;
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        case 'P2025': // Record not found
          message = `${exception.code}: The requested resource was not found`;
          status = HttpStatus.NOT_FOUND;
          break;
        default:
          message = `PrismaError: ${exception.code}`;
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
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
    } else if (status >= 400) {
      if (status !== 401) {
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
    }
    response.status(status).json({
      message: message,
      success: false,
      data: null,
      traceStack: process.env.NODE_ENV === 'development' && exception instanceof Error ? exception.stack : undefined,
    });
  }
}