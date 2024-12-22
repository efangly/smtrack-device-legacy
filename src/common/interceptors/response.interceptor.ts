import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.get<boolean>(
      'skipInterceptor',
      context.getHandler(),
    );
    if (skip) return next.handle(); // ข้าม Interceptor
    return next.handle().pipe(
      map((data) => ({
        message: 'Request Successfully',
        success: true,
        data: data || null,
      })),
    );
  }
}
