export const REDACTED_VALUE = "[REDACTED]";

const SENSITIVE_KEY_PATTERN =
  /authorization|token|secret|password|cookie|api[-_]?key|session/i;

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

export const redactSensitiveData = (value: unknown): unknown => {
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

      return [key, value];
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
