import crypto from 'node:crypto';
import type {NextRequest} from 'next/server';

export type PortalRole = 'super_admin' | 'admin' | 'user';

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: PortalRole;
  assignedLabIds: string[];
};

const SESSION_COOKIE = 'lab_portal_session';

function secret() {
  return process.env.AUTH_SECRET ?? process.env.SANITY_API_TOKEN ?? 'dev-secret';
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return {salt, hash};
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const {hash} = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

export function createSessionCookie(user: SessionUser) {
  const payload = JSON.stringify(user);
  const encodedPayload = base64UrlEncode(payload);
  const signature = crypto.createHmac('sha256', secret()).update(encodedPayload).digest('hex');
  return `${encodedPayload}.${signature}`;
}

export function parseSessionCookie(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac('sha256', secret()).update(encodedPayload).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(encodedPayload)) as SessionUser;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest) {
  return parseSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}