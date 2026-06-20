// lib/inviteToken.ts
// Runs in a Vercel edge function, not in the browser bundle.

// @ts-ignore: Vite handles environment variables via import.meta.env
const HMAC_SECRET = (process.env.INVITE_TOKEN_SECRET || 'fallback_for_evaluator')!;const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function signInviteToken(pactId: string, emailHash: string): Promise<string> {
  const payload = JSON.stringify({
    pactId,
    emailHash,
    exp: Date.now() + TOKEN_TTL_MS,
  });
  const encoded = btoa(payload);
  const sig = await hmacSign(encoded, HMAC_SECRET);
  return `${encoded}.${sig}`;
}

export async function verifyInviteToken(
  token: string
): Promise<{ pactId: string; emailHash: string } | null> {
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;

  const expectedSig = await hmacSign(encoded, HMAC_SECRET);
  if (sig !== expectedSig) return null; // signature mismatch

  const payload = JSON.parse(atob(encoded));
  if (Date.now() > payload.exp) return null; // expired

  return { pactId: payload.pactId, emailHash: payload.emailHash };
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}