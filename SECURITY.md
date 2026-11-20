# Security Policy for `markurtz`

The security of this website and the people who use it is taken seriously, especially the protected areas that hold private galleries and account data. This document explains what is supported and how to responsibly disclose a vulnerability.

## Supported Versions

This is a continuously deployed website, not a versioned package. Only the code on the `main` branch, which is what runs in production, receives security fixes.

| Version                       | Supported          |
| :---------------------------- | :----------------- |
| `main` (production)           | :white_check_mark: |
| Older commits and other forks | :x:                |

## Reporting a Vulnerability

> [!IMPORTANT]
> **Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

If you discover a security vulnerability, please report it privately with **GitHub Security Advisories**: use the "Report a vulnerability" button on the **[Security tab](https://github.com/markurtz/markurtz/security/advisories/new)** of this repository.

### What to Include in Your Report

To help resolve the issue quickly, please include the following information:

- **Type of vulnerability** (e.g., XSS, SQLi, authentication or authorization bypass, data exposure).
- **Detailed description** of the vulnerability and its potential impact.
- **Step-by-step instructions** to reproduce the issue, including the affected URL.
- **Proof of Concept (PoC)** code or screenshots, if available.

Please do not access, modify, or download data that is not yours while testing, and stop as soon as you have confirmed the issue.

## Triage and Resolution Process

Your report will be handled with strict confidentiality. This is a personal project maintained by one person, so the process is best-effort:

1. **Acknowledgment:** You can expect a response as soon as possible, usually within **7 days**.
2. **Triage:** The issue will be investigated to determine its validity and severity. You may be contacted for further clarification.
3. **Fix:** If the vulnerability is verified, a fix will be developed, tested, and deployed.
4. **Disclosure:** Disclosure will be coordinated with you once a fix is live. Your responsible disclosure will be publicly acknowledged, if you wish.

## Scope

**In Scope:**

- Vulnerabilities in the code in this repository and in the deployed website.
- Access-control issues in protected areas (logins, passcodes, private albums and collections).
- Security issues in the default configuration in this repository.

**Out of Scope:**

- Volumetric Denial of Service (DoS) attacks.
- Social engineering and physical attacks.
- Theoretical issues without a reproducible PoC.
- Vulnerabilities in third-party services or dependencies that are not exploitable through this website.
- Missing security headers or best practices that do not lead to a direct exploit.

_(Note: There is no bug bounty program. Disclosures are greatly appreciated but are not eligible for financial rewards.)_
