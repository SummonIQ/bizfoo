// Transfers a seeded storefront's organization to your real (signed-up) user
// by adding you as an "owner" member of that org.
//
// Usage:
//   STOREFRONT_SLUG=summoniq REAL_OWNER_EMAIL=you@example.com \
//     bun run scripts/transfer-storefront.ts

import "dotenv/config";
import { db } from "../lib/db/client";

async function main() {
  const storefrontSlug = process.env.STOREFRONT_SLUG;
  const realOwnerEmail = process.env.REAL_OWNER_EMAIL;

  if (!storefrontSlug || !realOwnerEmail) {
    console.error(
      "Set STOREFRONT_SLUG and REAL_OWNER_EMAIL. e.g.\n" +
        "  STOREFRONT_SLUG=summoniq REAL_OWNER_EMAIL=you@example.com bun run scripts/transfer-storefront.ts",
    );
    process.exit(1);
  }

  const realUser = await db.user.findUnique({ where: { email: realOwnerEmail } });
  if (!realUser) {
    console.error(
      `No user with email ${realOwnerEmail}. Sign up at /sign-up first.`,
    );
    process.exit(1);
  }

  const storefront = await db.storefront.findUnique({
    where: { slug: storefrontSlug },
    include: { organization: true },
  });
  if (!storefront) {
    console.error(`No storefront with slug ${storefrontSlug}`);
    process.exit(1);
  }

  const existing = await db.member.findUnique({
    where: {
      userId_organizationId: {
        userId: realUser.id,
        organizationId: storefront.organizationId,
      },
    },
  });

  if (!existing) {
    await db.member.create({
      data: {
        userId: realUser.id,
        organizationId: storefront.organizationId,
        role: "owner",
      },
    });
    console.log(
      `Added ${realOwnerEmail} as owner of ${storefront.organization.name}.`,
    );
  } else {
    await db.member.update({
      where: { id: existing.id },
      data: { role: "owner" },
    });
    console.log(
      `Updated ${realOwnerEmail} to owner of ${storefront.organization.name}.`,
    );
  }

  // Make this org the active one for any of the user's existing sessions.
  await db.session.updateMany({
    where: { userId: realUser.id },
    data: { activeOrganizationId: storefront.organizationId },
  });

  console.log(
    `Sign in fresh at https://bizfoo.com/sign-in to see the SummonIQ workspace.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
