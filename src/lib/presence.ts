// Un utilisateur est considéré "en ligne" s'il a été vu il y a moins de 2 minutes
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function isUserOnline(lastSeenAt: Date | null | undefined): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - lastSeenAt.getTime() < ONLINE_THRESHOLD_MS;
}
