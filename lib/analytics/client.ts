import { getAnalytics } from "@summoniq/signalsplash-client-sdk";
import type { EventPropertyValue } from "@summoniq/signalsplash-client-sdk";

export type AnalyticsTrack = (
  name: string,
  properties?: Record<string, EventPropertyValue>,
) => void;

export async function flushAnalytics() {
  await getAnalytics()?.flush().catch(() => undefined);
}

export async function trackAndFlush(
  track: AnalyticsTrack,
  name: string,
  properties?: Record<string, EventPropertyValue>,
) {
  track(name, properties);
  await flushAnalytics();
}
