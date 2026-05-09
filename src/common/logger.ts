import { Logger } from '@nestjs/common';

export enum LogSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface InfoOptions {
  message: string;
  title?: string;
  targetAudience?: string;
}

interface ErrorOptions {
  severity: LogSeverity;
  exception: Error | string;
  title?: string;
  targetAudience?: string;
}

export class AppLogger {
  private static getCallerClass(): string {
    const lines = (new Error().stack ?? '').split('\n');
    const callerLine = lines[3] ?? '';
    const match =
      callerLine.match(/at (?:new )?(\w+)\./) ??
      callerLine.match(/at (\w+) /);
    return match?.[1] ?? 'Unknown';
  }

  static info({ message, title, targetAudience }: InfoOptions): void {
    const caller = AppLogger.getCallerClass();
    const parts: string[] = [];
    if (title) parts.push(`[${title}]`);
    parts.push(message);
    if (targetAudience) parts.push(`→ Audience: ${targetAudience}`);
    Logger.log(parts.join(' '), caller);
  }

  static error({ severity, exception, title, targetAudience }: ErrorOptions): void {
    const caller = AppLogger.getCallerClass();
    const message = exception instanceof Error ? exception.message : exception;
    const stack = exception instanceof Error ? exception.stack : undefined;
    const parts: string[] = [`[${severity}]`];
    if (title) parts.push(`[${title}]`);
    parts.push(message);
    if (targetAudience) parts.push(`→ Audience: ${targetAudience}`);
    Logger.error(parts.join(' '), stack, caller);
  }
}
