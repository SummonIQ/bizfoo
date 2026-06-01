"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiKeysCard({
  publicKey,
  secretKey,
  slug,
}: {
  publicKey: string;
  secretKey: string;
  slug: string;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <KeyRow
          label="Public key"
          value={publicKey}
          hint="Safe to use from browsers."
          copied={copied === "public"}
          onCopy={() => copy(publicKey, "public")}
        />
        <KeyRow
          label="Secret key"
          value={secretKey}
          hint="Server-side only. Treat like a password."
          masked={!showSecret}
          onToggleMask={() => setShowSecret((s) => !s)}
          showMaskToggle
          copied={copied === "secret"}
          onCopy={() => copy(secretKey, "secret")}
        />
        <div className="rounded-lg border border-border bg-muted p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quickstart
          </div>
          <pre className="overflow-x-auto text-xs leading-5 text-foreground/80">
{`import { createBizfooClient } from "@summoniq/bizfoo-client-sdk";

const bizfoo = createBizfooClient({
  storefront: "${slug}",
  publicKey: "${publicKey.slice(0, 10)}...",
});

const { products } = await bizfoo.listProducts();
const { url } = await bizfoo.createCheckout({
  items: [{ priceId: products[0].prices[0].id }],
  email: "buyer@example.com",
});`}
          </pre>
        </div>
      </CardBody>
    </Card>
  );
}

function KeyRow({
  label,
  value,
  hint,
  masked = false,
  showMaskToggle = false,
  onToggleMask,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  hint: string;
  masked?: boolean;
  showMaskToggle?: boolean;
  onToggleMask?: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const display = masked ? value.replace(/./g, "•").slice(0, 32) : value;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
        <code className="flex-1 truncate font-mono text-xs text-foreground">
          {display}
        </code>
        {showMaskToggle ? (
          <button
            onClick={onToggleMask}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label={masked ? "Show" : "Hide"}
          >
            {masked ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
          </button>
        ) : null}
        <button
          onClick={onCopy}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Copy"
        >
          {copied ? (
            <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
