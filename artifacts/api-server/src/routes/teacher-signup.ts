import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  clerkClient,
  getAuth,
} from "@clerk/express";
import {
  CancelTeacherSignupResponse,
  ClaimTeacherSignupResponse,
  VerifyTeacherSignupCodeBody,
  VerifyTeacherSignupCodeResponse,
} from "@workspace/api-zod";
import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();
const proofCookieName = "teacher_signup_proof";
const proofLifetimeMs = 15 * 60 * 1000;
const attemptWindowMs = 15 * 60 * 1000;
const maxFailedAttempts = 5;
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

function isRateLimited(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (entry.resetAt <= Date.now()) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= maxFailedAttempts;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    failedAttempts.set(ip, { count: 1, resetAt: now + attemptWindowMs });
  } else {
    entry.count += 1;
  }

  if (failedAttempts.size > 1000) {
    for (const [key, value] of failedAttempts) {
      if (value.resetAt <= now || failedAttempts.size > 1000) {
        failedAttempts.delete(key);
      }
    }
  }
}

function secretsMatch(supplied: string, expected: string): boolean {
  const suppliedHash = createHash("sha256").update(supplied, "utf8").digest();
  const expectedHash = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(suppliedHash, expectedHash);
}

function createProof(sessionSecret: string): string {
  const payload = Buffer.from(JSON.stringify({
    purpose: "teacher-signup",
    expiresAt: Date.now() + proofLifetimeMs,
    nonce: randomBytes(16).toString("hex"),
  })).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function isValidProof(token: unknown, sessionSecret: string): boolean {
  if (typeof token !== "string") return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  const expectedSignature = createHmac("sha256", sessionSecret).update(payload).digest();
  const suppliedSignature = Buffer.from(signature, "base64url");
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return false;
  }

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      purpose?: unknown;
      expiresAt?: unknown;
    };
    return claims.purpose === "teacher-signup"
      && typeof claims.expiresAt === "number"
      && claims.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function requestIp(req: Request): string {
  return req.ip || "unknown";
}

router.post("/teacher-signup/verify", (req, res): void => {
  const parsed = VerifyTeacherSignupCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a teacher signup code." });
    return;
  }

  const teacherSignupCode = process.env.TEACHER_SIGNUP_CODE;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!teacherSignupCode || !sessionSecret) {
    req.log.error("Teacher signup is unavailable because a required secret is missing");
    res.status(503).json({ error: "Teacher signup is not available right now." });
    return;
  }

  const ip = requestIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many attempts. Wait before trying again." });
    return;
  }

  if (!secretsMatch(parsed.data.code, teacherSignupCode)) {
    recordFailedAttempt(ip);
    res.clearCookie(proofCookieName, cookieOptions());
    res.status(403).json({ error: "That code was not accepted." });
    return;
  }

  failedAttempts.delete(ip);
  res.cookie(proofCookieName, createProof(sessionSecret), {
    ...cookieOptions(),
    maxAge: proofLifetimeMs,
  });
  res.json(VerifyTeacherSignupCodeResponse.parse({ verified: true }));
});

router.post("/teacher-signup/claim", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to complete teacher signup." });
    return;
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!process.env.TEACHER_SIGNUP_CODE || !sessionSecret) {
    req.log.error("Teacher signup is unavailable because a required secret is missing");
    res.status(503).json({ error: "Teacher signup is not available right now." });
    return;
  }

  if (!isValidProof(req.cookies?.[proofCookieName], sessionSecret)) {
    res.clearCookie(proofCookieName, cookieOptions());
    res.status(403).json({ error: "Teacher signup proof is missing or expired." });
    return;
  }

  const user = await clerkClient.users.getUser(userId);
  const currentRole = user.publicMetadata.role;
  if (typeof currentRole === "string" && currentRole !== "teacher") {
    res.clearCookie(proofCookieName, cookieOptions());
    res.status(409).json({ error: "This account already has a different role." });
    return;
  }

  if (currentRole !== "teacher") {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "teacher" },
    });
  }

  res.clearCookie(proofCookieName, cookieOptions());
  res.json(ClaimTeacherSignupResponse.parse({ success: true }));
});

router.post("/teacher-signup/cancel", (_req, res): void => {
  res.clearCookie(proofCookieName, cookieOptions());
  res.json(CancelTeacherSignupResponse.parse({ success: true }));
});

export default router;
