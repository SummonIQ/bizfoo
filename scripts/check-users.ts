import "dotenv/config";
import { db } from "../lib/db/client";

const users = await db.user.findMany({
  select: { email: true, firstName: true, createdAt: true },
});
console.log("Users:", users);
const accounts = await db.account.findMany({
  select: { providerId: true, userId: true },
});
console.log("Accounts:", accounts);
await db.$disconnect();
