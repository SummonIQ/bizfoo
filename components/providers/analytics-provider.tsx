"use client";

import { useEffect, useRef } from "react";
import {
  AnalyticsProvider,
  WebVitals,
  useAnalytics,
} from "@summoniq/signalsplash-client-sdk/react";
import type { AnalyticsConfig } from "@summoniq/signalsplash-client-sdk";
import { authClient } from "@/lib/auth/client";

const envEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT?.trim();
const isProduction = process.env.NODE_ENV === "production";
const defaultEndpoint =
  isProduction
    ? "https://api.signalsplash.com/api/events"
    : "";
const resolvedEndpoint = envEndpoint || defaultEndpoint;
const isAnalyticsEnabled =
  isProduction &&
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false" &&
  Boolean(resolvedEndpoint);

const analyticsConfig: AnalyticsConfig = {
  appId: "bizfoo",
  endpoint: resolvedEndpoint || undefined,
  enabled: isAnalyticsEnabled,
  debug: false,
  trackPageViews: true,
  trackWebVitals: true,
  sessionTimeout: 30,
};

function AnalyticsIdentify() {
  const { data: session } = authClient.useSession();
  const { identify, reset } = useAnalytics();
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const user = session?.user;
    if (!user) {
      if (identifiedUserIdRef.current) {
        reset();
        identifiedUserIdRef.current = null;
      }
      return;
    }

    identify(user.id, {
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    });
    identifiedUserIdRef.current = user.id;
  }, [
    session?.user?.email,
    session?.user?.firstName,
    session?.user?.id,
    session?.user?.lastName,
    session?.user?.name,
    identify,
    reset,
  ]);

  return null;
}

export function AppAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalyticsProvider config={analyticsConfig}>
      <WebVitals />
      <AnalyticsIdentify />
      {children}
    </AnalyticsProvider>
  );
}
