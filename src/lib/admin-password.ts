/** Bcrypt hashes contain `$`, which Next.js/.env expand — use base64 in `.env`. */
export function getAdminPasswordHash(): string | undefined {
  const b64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim();
  if (b64) {
    return Buffer.from(b64, "base64").toString("utf8");
  }

  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (raw?.startsWith("$2")) return raw;

  return undefined;
}
