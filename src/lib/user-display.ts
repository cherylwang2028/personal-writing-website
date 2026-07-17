type UserLike = {
  username?: string | null;
  name?: string | null;
  email: string;
};

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string) {
  const username = normalizeUsername(value);
  return /^[a-z0-9_]{2,30}$/.test(username);
}

export function getDisplayUsername(user: UserLike) {
  if (user.username) return user.username;
  if (user.name?.trim()) return user.name.trim();
  return user.email.split("@")[0] ?? "reader";
}
