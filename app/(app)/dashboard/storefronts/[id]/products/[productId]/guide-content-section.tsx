"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Loader2, Save, Trash2 } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { FormPanel, ErrorBanner } from "@/components/ui/form-panel";
import { PlateMarkdownEditor } from "@/components/ui/plate-markdown-editor";
import type { ProductGuide } from "@/lib/product-guides";

type EditableChapter = ProductGuide["chapters"][number];

function createEmptyChapter(index: number): EditableChapter {
  return {
    id: `chapter-${index}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    minutes: 15,
    summary: "",
    sample: "",
    body: "",
    waypoints: [],
  };
}

function slugifyWaypointId(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || `waypoint-${Math.random().toString(36).slice(2, 7)}`;
}

export function GuideContentSection({
  productId,
  initialGuide,
}: {
  productId: string;
  initialGuide: ProductGuide;
}) {
  const router = useRouter();
  const [subtitle, setSubtitle] = useState(initialGuide.subtitle);
  const [sampleChapterCount, setSampleChapterCount] = useState(
    initialGuide.sampleChapterCount,
  );
  const [chapters, setChapters] = useState<EditableChapter[]>(
    initialGuide.chapters,
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErr(null);
    setSaved(false);

    const form = new FormData(event.currentTarget);
    const guide: ProductGuide = {
      slug: initialGuide.slug,
      title: initialGuide.title,
      subtitle: subtitle.trim(),
      sampleChapterCount: Math.min(sampleChapterCount, chapters.length),
      chapters: chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title.trim(),
        minutes: chapter.minutes,
        summary: chapter.summary.trim(),
        sample: String(form.get(`sample-${chapter.id}`) ?? "").trim(),
        body: String(form.get(`body-${chapter.id}`) ?? "").trim(),
        waypoints: (chapter.waypoints ?? [])
          .map((w) => ({ id: w.id.trim(), label: w.label.trim() }))
          .filter((w) => w.id && w.label),
      })),
    };

    const res = await fetch(`/api/products/${productId}/guide`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ guide }),
    });

    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setErr(json.error ?? "Could not save guide");
      return;
    }

    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Guide content</CardTitle>
          <div className="mt-1 text-sm text-muted-foreground">
            Bizfoo stores the guide body here and generates the buyer PDF from
            this content.
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <FormPanel onSubmit={handleSubmit}>
          <Field
            label="Subtitle"
            hint="Shown at the top of the guide and used in the PDF cover."
          >
            <Textarea
              rows={2}
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
            />
          </Field>

          <Field
            label="Public sample chapters"
            hint="The first N chapters stay visible on the public sample page."
          >
            <Input
              className="w-20"
              type="number"
              min={0}
              max={chapters.length}
              value={String(Math.min(sampleChapterCount, chapters.length))}
              onChange={(event) =>
                setSampleChapterCount(Math.max(0, Number(event.target.value) || 0))
              }
            />
          </Field>

          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">
              Chapters
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                setChapters((current) => [...current, createEmptyChapter(current.length + 1)])
              }
            >
              <CirclePlus className="size-4" />
              Add chapter
            </Button>
          </div>

          <div className="flex flex-col gap-5">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="rounded-xl border border-border bg-surface/60 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">Chapter {index + 1}</Badge>
                    {index < Math.min(sampleChapterCount, chapters.length) ? (
                      <Badge tone="success">Sample</Badge>
                    ) : (
                      <Badge>Paid</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setChapters((current) =>
                          current.filter((currentChapter) => currentChapter.id !== chapter.id),
                        )
                      }
                    >
                      <Trash2 className="size-3.5 text-rose-500" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1.5fr_120px]">
                  <Field label="Title">
                    <Input
                      value={chapter.title}
                      onChange={(event) =>
                        setChapters((current) =>
                          current.map((currentChapter) =>
                            currentChapter.id === chapter.id
                              ? { ...currentChapter, title: event.target.value }
                              : currentChapter,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Minutes">
                    <Input
                      type="number"
                      min={1}
                      max={600}
                      value={String(chapter.minutes)}
                      onChange={(event) =>
                        setChapters((current) =>
                          current.map((currentChapter) =>
                            currentChapter.id === chapter.id
                              ? {
                                  ...currentChapter,
                                  minutes: Math.max(1, Number(event.target.value) || 1),
                                }
                              : currentChapter,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>

                <Field
                  label="Summary"
                  hint="Used in the chapter list and on the guide landing surface."
                >
                  <Textarea
                    rows={3}
                    value={chapter.summary}
                    onChange={(event) =>
                      setChapters((current) =>
                        current.map((currentChapter) =>
                          currentChapter.id === chapter.id
                            ? { ...currentChapter, summary: event.target.value }
                            : currentChapter,
                        ),
                      )
                    }
                  />
                </Field>

                <Field
                  label="Sample excerpt"
                  hint="This is what the public sample reader shows before purchase."
                >
                  <PlateMarkdownEditor
                    key={`sample-${chapter.id}`}
                    name={`sample-${chapter.id}`}
                    defaultValue={chapter.sample}
                    mode="public"
                    preview="rich"
                    size="sm"
                    placeholder="Write the public sample excerpt..."
                  />
                </Field>

                <Field
                  label="Full chapter body"
                  hint="This is the private chapter content and the source for PDF export. Use the editor visual menu for diagrams and charts."
                >
                  <PlateMarkdownEditor
                    key={`body-${chapter.id}`}
                    name={`body-${chapter.id}`}
                    defaultValue={chapter.body}
                    mode="internal"
                    preview="rich"
                    size="lg"
                    placeholder="Write the full guide chapter..."
                  />
                </Field>

                <Field
                  label="Waypoints"
                  hint="Important sub-points the reader can jump to from the sidebar. The id should match an H2 slug in the chapter body (e.g. '## The flinch test' → 'the-flinch-test')."
                >
                  <div className="flex flex-col gap-2">
                    {(chapter.waypoints ?? []).map((waypoint, waypointIndex) => (
                      <div
                        key={waypointIndex}
                        className="flex items-center gap-2"
                      >
                        <Input
                          className="flex-1"
                          placeholder="Label"
                          value={waypoint.label}
                          onChange={(event) =>
                            setChapters((current) =>
                              current.map((c) =>
                                c.id === chapter.id
                                  ? {
                                      ...c,
                                      waypoints: (c.waypoints ?? []).map(
                                        (w, i) =>
                                          i === waypointIndex
                                            ? {
                                                ...w,
                                                label: event.target.value,
                                                id:
                                                  w.id ||
                                                  slugifyWaypointId(
                                                    event.target.value,
                                                  ),
                                              }
                                            : w,
                                      ),
                                    }
                                  : c,
                              ),
                            )
                          }
                        />
                        <Input
                          className="flex-1 font-mono text-xs"
                          placeholder="anchor-id"
                          value={waypoint.id}
                          onChange={(event) =>
                            setChapters((current) =>
                              current.map((c) =>
                                c.id === chapter.id
                                  ? {
                                      ...c,
                                      waypoints: (c.waypoints ?? []).map(
                                        (w, i) =>
                                          i === waypointIndex
                                            ? { ...w, id: event.target.value }
                                            : w,
                                      ),
                                    }
                                  : c,
                              ),
                            )
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setChapters((current) =>
                              current.map((c) =>
                                c.id === chapter.id
                                  ? {
                                      ...c,
                                      waypoints: (c.waypoints ?? []).filter(
                                        (_, i) => i !== waypointIndex,
                                      ),
                                    }
                                  : c,
                              ),
                            )
                          }
                        >
                          <Trash2 className="size-3.5 text-rose-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setChapters((current) =>
                          current.map((c) =>
                            c.id === chapter.id
                              ? {
                                  ...c,
                                  waypoints: [
                                    ...(c.waypoints ?? []),
                                    { id: "", label: "" },
                                  ],
                                }
                              : c,
                          ),
                        )
                      }
                    >
                      <CirclePlus className="size-4" />
                      Add waypoint
                    </Button>
                  </div>
                </Field>
              </div>
            ))}
          </div>

          <ErrorBanner>{err}</ErrorBanner>
          <div className="flex items-center justify-end gap-2">
            {saved ? (
              <span className="text-xs text-emerald-400">Saved</span>
            ) : null}
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save guide
                </>
              )}
            </Button>
          </div>
        </FormPanel>
      </CardBody>
    </Card>
  );
}
