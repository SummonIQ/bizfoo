// Releases the seed-bootstrapped user's email so the real owner can sign up.
// The placeholder user is renamed (not deleted) so the storefront/org survive.
//
// Usage:
//   bun run scripts/release-seed-email.ts <email-to-release>
//
// Then sign up at https://bizfoo.com/sign-up with that email. Run
// scripts/transfer-storefront.ts after to attach the storefront to your account.

import "dotenv/config";
import { db } from "../lib/db/client";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: bun run scripts/release-seed-email.ts <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user with email ${email}`);
    process.exit(1);
  }

  // Has the user actually signed in (i.e., do they have credentials)?
  const account = await db.account.findFirst({ where: { userId: user.id } });
  if (account) {
    console.error(
      `User ${email} has a real Account row (provider: ${account.providerId}). ` +
        `That looks like a real sign-up, not the placeholder. Refusing to rename.`,
    );
    process.exit(1);
  }

  const released = `seed+${user.id.slice(0, 8)}@bizfoo.local`;
  await db.user.update({
    where: { id: user.id },
    data: { email: released, emailVerified: false },
  });

  console.log(`Renamed placeholder ${email} → ${released}`);
  console.log(
    `You can now sign up at https://bizfoo.com/sign-up with ${email}.`,
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
