export const REDACTED_VALUE = "[REDACTED]";

const SENSITIVE_KEY_PATTERN =
  /authorization|token|secret|password|cookie|api[-_]?key|session/i;

export interface Logger {
  info(message: string, metadata?: unknown): void;
  error(message: string, metadata?: unknown): void;
}

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
  target: Pick<Console, "info" | "error"> = console
): Logger => {
  return {
    info(message, metadata) {
      target.info(message, redactSensitiveData(metadata));
    },
    error(message, metadata) {
      target.error(message, redactSensitiveData(metadata));
    }
  };
};
