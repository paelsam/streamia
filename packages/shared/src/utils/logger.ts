/**
 * Logger utility for distributed logging across microfrontends
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  microfrontend: string;
  correlationId: string;
  message: string;
  data?: any;
}

class Logger {
  private microfrontendName: string;

  constructor(name: string) {
    this.microfrontendName = name;
  }

  private getCorrelationId(): string {
    let id = sessionStorage.getItem('correlationId');
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('correlationId', id);
    }
    return id;
  }

  private log(level: LogEntry['level'], message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      microfrontend: this.microfrontendName,
      correlationId: this.getCorrelationId(),
      message,
      data,
    };

    // Console output with color coding
    const color = {
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      debug: '\x1b[35m',
    }[level];

    console[level === 'debug' ? 'log' : level](
      `${color}[${entry.microfrontend}]${'\x1b[0m'} ${entry.message}`,
      data || ''
    );

    // In production, send to logging service (e.g., Sentry, LogRocket)
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      console.log('Sending error log to tracking service:', entry);
    }
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
}

/**
 * Create a logger instance for a microfrontend
 */
export const createLogger = (name: string): Logger => new Logger(name);
