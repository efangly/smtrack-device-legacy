import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
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

    response.status(status).json({
      message: message,
      success: false,
      data: null,
      traceStack: process.env.NODE_ENV === 'development' && exception instanceof Error ? exception.stack : undefined,
    });
  }
}
