# 🔐 API Security Scanner

A lightweight CLI tool for detecting common API security misconfigurations and insecure patterns.

Built as part of a transition into **Application Security (AppSec)** and **Security Automation**.

---

## 🚀 Overview

API Security Scanner helps developers and QA engineers quickly identify common security issues in APIs, such as:

* Missing authentication
* Weak CORS configuration
* Missing security headers
* Insecure transport (HTTP)
* Sensitive data exposure

The tool is designed to be:

* Fast ⚡
* Simple to use 🧰
* CI/CD friendly 🔄

---

## 🧠 Why This Project Exists

Modern APIs are often deployed quickly without basic security checks.

This tool provides a **first layer of automated security validation** to catch common misconfigurations early in development or testing.

---

## 🏗️ Current Status

🚧 **Phase 1 Complete - Project Bootstrap**

* Node.js + TypeScript setup
* CLI entry point
* Project structure initialized
* Linting, formatting, and testing configured

Next steps:

* Core scanning engine
* Security rules implementation
* Reporting system

---

## 📦 Tech Stack

* Node.js
* TypeScript
* Commander (CLI)
* Axios (HTTP)
* Zod (validation)
* Vitest (testing)

---

## 📂 Project Structure

```text
api-security-scanner/
├── src/
├── test/
├── examples/
├── .github/
├── PROJECT_SPEC.md
├── IMPLEMENTATION_PLAN.md
├── CODEX_PROMPTS.md
└── README.md
```

---

## ⚙️ Installation

```bash
git clone https://github.com/YOUR_USERNAME/api-security-scanner.git
cd api-security-scanner
npm install
```

---

## ▶️ Usage

```bash
npm run dev
```

(Currently prints a basic CLI message. Full scanning functionality is in progress.)

---

## 🛠️ Roadmap

### v0.1 (in progress)

* CLI bootstrap ✅
* Core types
* Config loader

### v0.2

* HTTP scanning engine
* Basic security checks:

  * HTTPS enforcement
  * Missing auth detection
  * CORS misconfiguration
  * Security headers

### v0.3

* JSON reporting
* Console output improvements

### v1.0

* HTML reports
* CI integration
* Demo vulnerable API

---

## 🔒 Security Disclaimer

This tool is intended for **authorized testing only**.

* Do NOT scan systems without permission
* This tool does NOT replace professional security audits or penetration testing
* Findings are heuristic and may require manual validation

---

## 💡 Future Improvements

* OpenAPI-based scanning
* SARIF output
* GitHub Actions integration
* Custom rule packs
* AI-assisted analysis

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

---

## 📣 Author

Built by a Senior QA Automation Engineer transitioning into **Cybersecurity / AppSec**.

---

## ⭐ If you find this useful

Give the repo a star ⭐ and follow the journey!
