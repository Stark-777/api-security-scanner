export const REDACTED_VALUE = "[REDACTED]";

const SENSITIVE_KEY_PATTERN =
  /authorization|token|secret|password|cookie|api[-_]?key|session/i;

const STRING_REDACTION_PATTERNS = {
  authorizationHeader:
    /\b(Authorization\s*:\s*)(Bearer|Basic)\s+[A-Za-z0-9._~+/-]+\b/gi,
  bearer: /\b(Bearer\s+)[A-Za-z0-9._~+/-]+\b/gi,
  basic: /\b(Basic\s+)[A-Za-z0-9+/=._-]+\b/gi,
  query: /([?&](?:token|secret|password|api[_-]?key|session|authorization)=)([^&\s]+)/gi,
  assignment:
    /((?:token|secret|password|api[_-]?key|session|cookie)\s*[:=]\s*)(["']?)([^"&',;\s}]+)\2/gi
};

export interface Logger {
  info(message: string, metadata?: unknown): void;
  warn(message: string, metadata?: unknown): void;
  error(message: string, metadata?: unknown): void;
}

const redactMetadata = (metadata?: unknown): unknown => {
  if (metadata === undefined) {
    return undefined;
  }

  return redactSensitiveData(metadata);
};

export const redactSensitiveString = (value: string): string => {
  return value
    .replace(
      STRING_REDACTION_PATTERNS.authorizationHeader,
      (_match, prefix: string, scheme: string) => `${prefix}${scheme} ${REDACTED_VALUE}`
    )
    .replace(
      STRING_REDACTION_PATTERNS.bearer,
      (_match, prefix: string) => `${prefix}${REDACTED_VALUE}`
    )
    .replace(
      STRING_REDACTION_PATTERNS.basic,
      (_match, prefix: string) => `${prefix}${REDACTED_VALUE}`
    )
    .replace(
      STRING_REDACTION_PATTERNS.query,
      (_match, prefix: string) => `${prefix}${REDACTED_VALUE}`
    )
    .replace(
      STRING_REDACTION_PATTERNS.assignment,
      (_match, prefix: string, quote: string) =>
        `${prefix}${quote}${REDACTED_VALUE}${quote}`
    );
};

export const redactSensitiveData = (value: unknown): unknown => {
  if (typeof value === "string") {
    return redactSensitiveString(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitiveData(entry));
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => {
        if (SENSITIVE_KEY_PATTERN.test(key)) {
          return [key, REDACTED_VALUE];
        }

        return [key, redactSensitiveData(entryValue)];
      })
    );
  }

  return value;
};

export const redactHeaders = (
  headers: Record<string, string> = {}
): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        return [key, REDACTED_VALUE];
      }

      return [key, redactSensitiveString(value)];
    })
  );
};

export const createLogger = (
  target: Pick<Console, "info" | "warn" | "error"> = console
): Logger => {
  return {
    info(message, metadata) {
      target.info(message, redactMetadata(metadata));
    },
    warn(message, metadata) {
      target.warn(message, redactMetadata(metadata));
    },
    error(message, metadata) {
      target.error(message, redactMetadata(metadata));
    }
  };
};
