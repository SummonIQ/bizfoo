"use client";

import { useState } from "react";
import { CheckCircle2, Code2, Mail } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend route yet — this opens a mailto with the message body.
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(
      `bizfoo contact: ${data.get("name") ?? "anonymous"}`,
    );
    const body = encodeURIComponent(
      `From: ${data.get("email") ?? "anonymous"}\n\n${data.get("message") ?? ""}`,
    );
    window.location.href = `mailto:hi@bizfoo.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div>
      <section className="border-b border-white/5 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-balance text-5xl font-bold text-white md:text-6xl">
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Sales, support, partnerships, ideas — we read everything.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardBody>
              {submitted ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 text-brand-300" />
                  <div>
                    <div className="font-semibold text-white">
                      Email opened
                    </div>
                    <p className="mt-1 text-sm text-white/70">
                      Send the email when ready and we&apos;ll get back to you
                      within a business day.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <Field label="Your name">
                    <Input name="name" required placeholder="Jane Maker" />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      name="email"
                      required
                      placeholder="jane@maker.com"
                    />
                  </Field>
                  <Field label="What can we help with?">
                    <Textarea
                      name="message"
                      required
                      placeholder="A quick question, a feature request, a bug report..."
                    />
                  </Field>
                  <div className="flex justify-end">
                    <Button type="submit">Send message</Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:hi@bizfoo.com"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
            >
              <Mail className="size-5 text-brand-300" />
              <div>
                <div className="text-sm font-semibold text-white">
                  hi@bizfoo.com
                </div>
                <div className="text-xs text-white/50">
                  General + sales — replies within 1 business day
                </div>
              </div>
            </a>
            <a
              href="https://github.com/bright-and-early/bizfoo/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
            >
              <Code2 className="size-5 text-brand-300" />
              <div>
                <div className="text-sm font-semibold text-white">
                  GitHub Issues
                </div>
                <div className="text-xs text-white/50">
                  Bug reports + feature requests
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
