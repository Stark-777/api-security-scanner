import { describe, expect, it } from "vitest";

import { Severity } from "../../src/core/severity.js";
import { CorsRule } from "../../src/rules/cors.rule.js";
import { HttpsEnforcedRule } from "../../src/rules/https-enforced.rule.js";
import { MissingAuthRule } from "../../src/rules/missing-auth.rule.js";
import { SecurityHeadersRule } from "../../src/rules/security-headers.rule.js";
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
