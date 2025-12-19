/**
 * PHI-safe logging utility that masks sensitive healthcare information
 * Ensures HIPAA compliance by preventing PII/PHI in logs
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  correlationId?: string;
  [key: string]: any;
}

const PHI_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  userId: /(userId|patientId|doctorId|user\.id|id":\s*")[^"]*"/g,
  password: /(password|pwd)[^,}]*/gi,
};

/**
 * Masks sensitive data in strings
 */
export const maskPHI = (value: string): string => {
  if (!value || typeof value !== 'string') return value;

  let masked = value;

  // Mask emails
  masked = masked.replace(PHI_PATTERNS.email, '[EMAIL_REDACTED]');

  // Mask phone numbers
  masked = masked.replace(PHI_PATTERNS.phone, '[PHONE_REDACTED]');

  // Mask SSNs
  masked = masked.replace(PHI_PATTERNS.ssn, '[SSN_REDACTED]');

  // Mask credit cards
  masked = masked.replace(PHI_PATTERNS.creditCard, '[CARD_REDACTED]');

  // Mask passwords
  masked = masked.replace(PHI_PATTERNS.password, '[PASSWORD_REDACTED]');

  return masked;
};

/**
 * Deep masks sensitive fields in objects
 */
export const maskObject = (obj: any, fieldsToMask: string[] = []): any => {
  if (!obj || typeof obj !== 'object') return obj;

  const defaultMaskFields = ['password', 'email', 'phone', 'ssn', 'creditCard', 'token', 'authorization'];
  const allMaskFields = [...defaultMaskFields, ...fieldsToMask];

  const cloned = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in cloned) {
    if (allMaskFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      cloned[key] = '[REDACTED]';
    } else if (typeof cloned[key] === 'string') {
      cloned[key] = maskPHI(cloned[key]);
    } else if (typeof cloned[key] === 'object' && cloned[key] !== null) {
      cloned[key] = maskObject(cloned[key], fieldsToMask);
    }
  }

  return cloned;
};

/**
 * PHI-safe logger
 */
export class PHISafeLogger {
  private static maskFields: string[] = [];

  static setMaskFields(fields: string[]) {
    this.maskFields = fields;
  }

  private static formatLogEntry(level: LogLevel, message: string, data?: any, correlationId?: string): LogEntry {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message: maskPHI(message),
      ...(correlationId && { correlationId }),
    };

    if (data) {
      entry.data = maskObject(data, this.maskFields);
    }

    return entry;
  }

  static error(message: string, data?: any, correlationId?: string) {
    const entry = this.formatLogEntry(LogLevel.ERROR, message, data, correlationId);
    console.error(JSON.stringify(entry));
  }

  static warn(message: string, data?: any, correlationId?: string) {
    const entry = this.formatLogEntry(LogLevel.WARN, message, data, correlationId);
    console.warn(JSON.stringify(entry));
  }

  static info(message: string, data?: any, correlationId?: string) {
    const entry = this.formatLogEntry(LogLevel.INFO, message, data, correlationId);
    console.log(JSON.stringify(entry));
  }

  static debug(message: string, data?: any, correlationId?: string) {
    const entry = this.formatLogEntry(LogLevel.DEBUG, message, data, correlationId);
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify(entry));
    }
  }
}
