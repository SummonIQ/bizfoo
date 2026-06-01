"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncProductButton({
  productId,
  isSynced,
}: {
  productId: string;
  isSynced: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sync() {
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/products/${productId}/sync`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Sync failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {err ? <div className="text-sm text-rose-600">{err}</div> : null}
      <Button onClick={sync} disabled={busy} variant={isSynced ? "outline" : "primary"}>
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Syncing...
          </>
        ) : isSynced ? (
          <>
            <Check className="size-4" />
            Resync to Stripe
          </>
        ) : (
          "Sync to Stripe"
        )}
      </Button>
    </div>
  );
}
