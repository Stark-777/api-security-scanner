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
});
