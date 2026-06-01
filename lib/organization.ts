import "server-only";
import { cookies, headers } from "next/headers";
import { Prisma } from "../generated/prisma/client";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";

const ACTIVE_ORGANIZATION_COOKIE = "bf_active_organization";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "workspace"
  );
}

async function reserveSlug(baseName: string) {
  const base = slugify(baseName);
  for (let i = 0; i < 10; i += 1) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await db.organization.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function loadFirstMember(userId: string) {
  return db.member.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function getAuthSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function ensureOrganizationContext() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const cookieStore = await cookies();
  const activeOrganizationId =
    cookieStore.get(ACTIVE_ORGANIZATION_COOKIE)?.value ?? null;

  if (activeOrganizationId) {
    const member = await db.member.findFirst({
      where: { userId: session.user.id, organizationId: activeOrganizationId },
      include: { organization: true },
    });
    if (member) {
      return {
        session,
        user: session.user,
        member,
        organization: member.organization,
      };
    }
  }

  let member = await loadFirstMember(session.user.id);

  if (!member) {
    const displayName =
      `${session.user.name ?? ""}`.trim() ||
      `${(session.user as { firstName?: string }).firstName ?? ""} ${(session.user as { lastName?: string }).lastName ?? ""}`.trim() ||
      session.user.email?.split("@")[0] ||
      "Workspace";
    for (let attempt = 0; attempt < 3 && !member; attempt += 1) {
      try {
        const organization = await db.organization.create({
          data: {
            name: `${displayName} Workspace`,
            slug: await reserveSlug(displayName),
          },
        });

        await db.member.create({
          data: {
            userId: session.user.id,
            organizationId: organization.id,
            role: "owner",
          },
        });
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
      }

      member = await loadFirstMember(session.user.id);
    }
  }

  if (!member) throw new Error("Failed to initialize organization context");

  return {
    session,
    user: session.user,
    member,
    organization: member.organization,
  };
}
