import { redirect } from "next/navigation";
import { ensureOrganizationContext } from "@/lib/organization";
import { db } from "@/lib/db/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await ensureOrganizationContext();
  if (!context) redirect("/sign-in");

  const memberships = await db.member.findMany({
    where: { userId: context.user.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  const organizations = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    role: m.role,
  }));

  return (
    <DashboardShell
      organizations={organizations}
      activeOrganizationId={context.organization.id}
      userEmail={context.user.email}
    >
      {children}
    </DashboardShell>
  );
}
