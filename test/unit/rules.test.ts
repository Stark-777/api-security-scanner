import { describe, expect, it } from "vitest";

import { Severity } from "../../src/core/severity.js";
import { ContentTypeRule } from "../../src/rules/content-type.rule.js";
import { CorsRule } from "../../src/rules/cors.rule.js";
import { DangerousMethodsRule } from "../../src/rules/dangerous-methods.rule.js";
import { HttpsEnforcedRule } from "../../src/rules/https-enforced.rule.js";
import { RateLimitRule } from "../../src/rules/rate-limit.rule.js";
import { MissingAuthRule } from "../../src/rules/missing-auth.rule.js";
import { SensitiveDataExposureRule } from "../../src/rules/sensitive-data-exposure.rule.js";
import { SecurityHeadersRule } from "../../src/rules/security-headers.rule.js";
import { VerboseErrorsRule } from "../../src/rules/verbose-errors.rule.js";
import type { RuleContext } from "../../src/rules/rule.js";

const createContext = (overrides: Partial<RuleContext> = {}): RuleContext => {
  return {
    endpoint: {
      url: "https://api.example.com/users",
      method: "GET"
    },
    response: {
      status: 200,
      headers: {},
      data: null
    },
    ...overrides
  };
};

describe("HttpsEnforcedRule", () => {
  it("returns a structured finding for non-https endpoints", () => {
    const rule = new HttpsEnforcedRule();
    const findings = rule.evaluate(
      createContext({
        endpoint: {
          url: "http://api.example.com/users",
          method: "GET"
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "https-enforced",
      severity: Severity.High,
      endpoint: "http://api.example.com/users",
      method: "GET"
    });
    expect(findings[0].timestamp).toEqual(expect.any(String));
  });

  it("returns no findings for https endpoints", () => {
    const rule = new HttpsEnforcedRule();

    expect(rule.evaluate(createContext())).toEqual([]);
  });
});

describe("MissingAuthRule", () => {
  it("returns a finding when an endpoint responds without auth", () => {
    const rule = new MissingAuthRule();
    const findings = rule.evaluate(createContext());

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "missing-auth",
      severity: Severity.High,
      endpoint: "https://api.example.com/users",
      method: "GET"
    });
  });

  it("skips findings when auth is already present", () => {
    const rule = new MissingAuthRule();
    const findings = rule.evaluate(
      createContext({
        endpoint: {
          url: "https://api.example.com/users",
          method: "GET",
          headers: {
            Authorization: "Bearer token"
          }
        }
      })
    );

    expect(findings).toEqual([]);
  });

  it("skips findings when the response indicates auth is enforced", () => {
    const rule = new MissingAuthRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 401,
          headers: {},
          data: null
        }
      })
    );

    expect(findings).toEqual([]);
  });
});

describe("CorsRule", () => {
  it("returns a finding for wildcard origins", () => {
    const rule = new CorsRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "access-control-allow-origin": "*"
          },
          data: null
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "cors-misconfiguration",
      severity: Severity.Medium
    });
  });

  it("returns a finding for credentialed cross-origin access", () => {
    const rule = new CorsRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "https://app.example.com",
            "Access-Control-Allow-Credentials": "true"
          },
          data: null
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "cors-misconfiguration",
      title: "CORS allows credentials across origins",
      severity: Severity.Medium
    });
  });

  it("returns no findings for restrictive CORS headers", () => {
    const rule = new CorsRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "access-control-allow-origin": "https://app.example.com"
          },
          data: null
        }
      })
    );

    expect(findings).toEqual([]);
  });
});

describe("SecurityHeadersRule", () => {
  it("returns a finding when recommended headers are missing", () => {
    const rule = new SecurityHeadersRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "x-frame-options": "DENY"
          },
          data: null
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "security-headers",
      severity: Severity.Medium
    });
    expect(findings[0].evidence).toContain("strict-transport-security");
  });

  it("returns no findings when all recommended headers are present", () => {
    const rule = new SecurityHeadersRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "strict-transport-security": "max-age=31536000",
            "x-content-type-options": "nosniff",
            "x-frame-options": "DENY",
            "content-security-policy": "default-src 'self'"
          },
          data: null
        }
      })
    );

    expect(findings).toEqual([]);
  });
});

describe("DangerousMethodsRule", () => {
  it("returns a finding for dangerous mutating methods", () => {
    const rule = new DangerousMethodsRule();
    const findings = rule.evaluate(
      createContext({
        endpoint: {
          url: "https://api.example.com/users/1",
          method: "DELETE"
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "dangerous-methods",
      severity: Severity.Medium,
      method: "DELETE"
    });
  });

  it("returns no findings for safe methods", () => {
    const rule = new DangerousMethodsRule();

    expect(rule.evaluate(createContext())).toEqual([]);
  });
});

describe("SensitiveDataExposureRule", () => {
  it("returns a finding when response data appears sensitive", () => {
    const rule = new SensitiveDataExposureRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "content-type": "application/json"
          },
          data: {
            token: "super-secret-token"
          }
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "sensitive-data-exposure",
      severity: Severity.High
    });
  });

  it("returns no findings for benign response data", () => {
    const rule = new SensitiveDataExposureRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "content-type": "application/json"
          },
          data: {
            users: ["alice", "bob"]
          }
        }
      })
    );

    expect(findings).toEqual([]);
  });
});

describe("VerboseErrorsRule", () => {
  it("returns a finding for verbose error bodies", () => {
    const rule = new VerboseErrorsRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 500,
          headers: {
            "content-type": "text/plain"
          },
          data: "ReferenceError: x is not defined\n at handler.js:12:4"
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "verbose-errors",
      severity: Severity.Medium
    });
  });

  it("returns no findings for non-error responses", () => {
    const rule = new VerboseErrorsRule();

    expect(rule.evaluate(createContext())).toEqual([]);
  });
});

describe("RateLimitRule", () => {
  it("returns a finding when rate-limit indicators are missing", () => {
    const rule = new RateLimitRule();
    const findings = rule.evaluate(createContext());

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "missing-rate-limit-indicators",
      severity: Severity.Low
    });
  });

  it("returns no findings when rate-limit headers are present", () => {
    const rule = new RateLimitRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "x-ratelimit-limit": "100",
            "x-ratelimit-remaining": "50"
          },
          data: null
        }
      })
    );

    expect(findings).toEqual([]);
  });
});

describe("ContentTypeRule", () => {
  it("returns a finding when content-type is missing", () => {
    const rule = new ContentTypeRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {},
          data: {
            ok: true
          }
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "content-type-validation",
      severity: Severity.Medium,
      title: "Response is missing a Content-Type header"
    });
  });

  it("returns a finding for structured responses with unexpected content-type", () => {
    const rule = new ContentTypeRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "content-type": "text/plain"
          },
          data: {
            ok: true
          }
        }
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: "content-type-validation",
      severity: Severity.Medium,
      title: "Structured response uses an unexpected Content-Type"
    });
  });

  it("returns no findings for JSON responses with correct content-type", () => {
    const rule = new ContentTypeRule();
    const findings = rule.evaluate(
      createContext({
        response: {
          status: 200,
          headers: {
            "content-type": "application/json"
          },
          data: {
            ok: true
          }
        }
      })
    );

    expect(findings).toEqual([]);
  });
});
