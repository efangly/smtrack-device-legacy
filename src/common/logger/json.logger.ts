import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

interface LogEntry {
  timestamp: string;
  level: 'warn' | 'error';
  message: string;
  context?: string;
  trace?: string;
  metadata?: Record<string, any>;
  service: string;
  environment: string;
}

@Injectable()
export class JsonLogger implements LoggerService {
  private readonly serviceName = 'smtrack-device-legacy-service';
  private readonly environment = process.env.NODE_ENV || 'development';

  /**
   * Write a 'log' level log - DISABLED (only warn and error)
   */
  log(message: any, context?: string): void {
    // Silently ignore - only warn and error logs are output
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, trace?: string, context?: string): void {
    this.writeLog('error', message, context, trace);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, context?: string): void {
    this.writeLog('warn', message, context);
  }

  /**
   * Write a 'debug' level log - DISABLED (only warn and error)
   */
  debug(message: any, context?: string): void {
    // Silently ignore - only warn and error logs are output
  }

  /**
   * Write a 'verbose' level log - DISABLED (only warn and error)
   */
  verbose(message: any, context?: string): void {
    // Silently ignore - only warn and error logs are output
  }

  /**
   * Set log levels - only warn and error are supported
   */
  setLogLevels?(levels: LogLevel[]): void {
    // Only warn and error levels are supported in this implementation
  }

  private writeLog(
    level: 'error' | 'warn',
    message: any,
    context?: string,
    trace?: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.formatMessage(message),
      service: this.serviceName,
      environment: this.environment,
    };

    if (context) {
      logEntry.context = context;
    }

    if (trace) {
      logEntry.trace = trace;
    }

    if (metadata) {
      logEntry.metadata = metadata;
    }

    // Output to stdout as JSON - only warn and error levels
    process.stdout.write(JSON.stringify(logEntry) + '\n');
  }

  private formatMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    
    if (message instanceof Error) {
      return message.message;
    }

    if (typeof message === 'object') {
      return JSON.stringify(message);
    }

    return String(message);
  }

  /**
   * Log an error with additional metadata
   */
  logError(
    message: string,
    error?: Error,
    context?: string,
    metadata?: Record<string, any>
  ): void {
    const trace = error?.stack;
    const errorMessage = error ? `${message}: ${error.message}` : message;
    
    this.writeLog('error', errorMessage, context, trace, {
      ...metadata,
      errorName: error?.name,
    });
  }

  /**
   * Log a warning with additional metadata
   */
  logWarning(
    message: string,
    context?: string,
    metadata?: Record<string, any>
  ): void {
    this.writeLog('warn', message, context, undefined, metadata);
  }

  /**
   * Static method to create a logger instance with context
   */
  static create(context?: string): JsonLogger {
    const logger = new JsonLogger();
    return logger;
  }
}