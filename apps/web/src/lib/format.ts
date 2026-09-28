/** The team works from Spain: show times the way they read them. */
export const APP_TIME_ZONE = "Europe/Madrid";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

export function formatDateTime(iso: string) {
  return dateTimeFormat.format(new Date(iso));
}

export function responseMinutes(receivedIso: string, sentIso: string) {
  return Math.round((Date.parse(sentIso) - Date.parse(receivedIso)) / 60_000);
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
}

/** Past a working day, a first reply is slow for every brand we have today. */
export const SLOW_RESPONSE_MINUTES = 24 * 60;
