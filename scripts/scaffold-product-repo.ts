// Scaffold a private GitHub repo for a product from a carrier template,
// substitute identifiers, push, and record the resulting repoUrl on the
// product in bizfoo. Optionally deploys a Vercel preview.
//
// Usage:
//   npx tsx scripts/scaffold-product-repo.ts <product-slug> [--template nextjs-app-base] [--deploy]
//
// Depends on:
//   - gh CLI authed against SummonIQ org
//   - vercel CLI authed against summon-iq team (only if --deploy passed)
//   - DATABASE_URL for bizfoo

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

const ORG = "SummonIQ";
const DEFAULT_TEMPLATE = "nextjs-app-base";

type Args = { slug: string; template: string; deploy: boolean };

function parseArgs(): Args {
  const [slug, ...rest] = process.argv.slice(2);
  if (!slug) {
    console.error("usage: scaffold-product-repo <slug> [--template <name>] [--deploy]");
    process.exit(1);
  }
  const args: Args = { slug, template: DEFAULT_TEMPLATE, deploy: false };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--template") args.template = rest[++i];
    else if (rest[i] === "--deploy") args.deploy = true;
  }
  return args;
}

function sh(cmd: string, opts: { cwd?: string; silent?: boolean } = {}): string {
  try {
    return execSync(cmd, { cwd: opts.cwd, stdio: opts.silent ? "pipe" : "inherit", encoding: "utf8" });
  } catch (err) {
    throw new Error(`Command failed: ${cmd}\n${(err as Error).message}`);
  }
}

function shOut(cmd: string, cwd?: string): string {
  return execSync(cmd, { cwd, encoding: "utf8" }).trim();
}

// Replace the placeholder tokens in the scaffolded repo. Walks the tree
// once, skipping .git and node_modules.
function substitute(root: string, vars: Record<string, string>) {
  const skip = new Set([".git", "node_modules", ".next", ".vercel"]);
  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      if (skip.has(name)) continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) {
        walk(p);
        continue;
      }
      const buf = readFileSync(p);
      // Best-effort: treat only likely-text files. Heuristic: no NUL bytes in first 1024.
      const sample = buf.subarray(0, Math.min(1024, buf.length));
      if (sample.includes(0)) continue;
      let text = buf.toString("utf8");
      let changed = false;
      for (const [token, value] of Object.entries(vars)) {
        if (text.includes(token)) {
          text = text.split(token).join(value);
          changed = true;
        }
      }
      if (changed) writeFileSync(p, text);
    }
  }
  walk(root);
}

async function main() {
  const args = parseArgs();

  const product = await db.product.findFirst({ where: { slug: args.slug } });
  if (!product) {
    console.error(`No product in bizfoo with slug "${args.slug}"`);
    process.exit(1);
  }
  if (product.repoUrl) {
    console.log(`⚠  Product already has repoUrl=${product.repoUrl} — aborting to avoid clobber.`);
    console.log(`   Clear Product.repoUrl in bizfoo first if you want to re-scaffold.`);
    process.exit(0);
  }

  const repoName = args.slug;
  const repoFull = `${ORG}/${repoName}`;
  const tmpParent = mkdtempSync(join(tmpdir(), `scaffold-${args.slug}-`));
  const clonePath = join(tmpParent, repoName);

  console.log(`\n▸ Creating ${repoFull} from template ${ORG}/${args.template} ...`);
  sh(
    `gh repo create ${repoFull} --private --template ${ORG}/${args.template} --description ${JSON.stringify(
      product.tagline ?? product.name,
    )} --clone=false`,
  );

  // GitHub instantiates templates asynchronously — poll until main has a
  // commit before cloning, or we end up with an empty repo.
  console.log(`▸ Waiting for template instantiation ...`);
  for (let i = 0; i < 30; i++) {
    try {
      const sha = shOut(`gh api /repos/${repoFull}/commits/main --jq .sha`);
      if (sha) break;
    } catch {
      // branch not yet created — wait
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`▸ Cloning ...`);
  sh(`git clone git@github.com:${repoFull}.git ${clonePath}`);

  console.log(`▸ Substituting product identifiers ...`);
  substitute(clonePath, {
    __PRODUCT_SLUG__: product.slug,
    __PRODUCT_NAME__: product.name,
    __PRODUCT_TAGLINE__: product.tagline ?? product.name,
  });

  // Only commit if anything changed.
  const changed = shOut(`git status --porcelain`, clonePath);
  if (changed) {
    sh(`git add -A`, { cwd: clonePath });
    sh(
      `git -c user.email=bright-and-early@outlook.com -c user.name="Steven Bennett" commit -m ${JSON.stringify(
        `chore: substitute product identifiers (${args.slug})`,
      )}`,
      { cwd: clonePath },
    );
    sh(`git push origin main`, { cwd: clonePath });
  } else {
    console.log(`   (no substitutions needed)`);
  }

  const repoUrl = `https://github.com/${repoFull}`;
  let demoUrl: string | null = null;

  if (args.deploy) {
    console.log(`▸ Deploying preview to Vercel ...`);
    try {
      sh(`vercel link --yes --scope summon-iq --project ${repoName}`, { cwd: clonePath });
      const out = shOut(`vercel deploy --yes --scope summon-iq`, clonePath);
      const match = out.match(/https:\/\/\S+\.vercel\.app/);
      demoUrl = match ? match[0] : null;
    } catch (err) {
      console.log(`   Vercel deploy failed (non-fatal): ${(err as Error).message}`);
    }
  }

  console.log(`▸ Updating bizfoo ...`);
  await db.product.update({
    where: { id: product.id },
    data: {
      repoUrl,
      ...(demoUrl ? { demoUrl } : {}),
    },
  });

  // Ensure a REPO deliverable exists so the grant → github-invite flow can
  // find it without manual dashboard work.
  const existing = await db.deliverable.findFirst({
    where: { productId: product.id, type: "REPO" },
  });
  if (!existing) {
    await db.deliverable.create({
      data: {
        productId: product.id,
        title: `${product.name} repo`,
        slug: "repo",
        type: "REPO",
        status: "READY",
        access: "BUYERS_ONLY",
        url: repoUrl,
      },
    });
  } else if (!existing.url) {
    await db.deliverable.update({ where: { id: existing.id }, data: { url: repoUrl } });
  }

  // Promote the BuildPlan stage if it was still IDEA/SPEC.
  const bp = await db.buildPlan.findUnique({ where: { productId: product.id } });
  if (bp && (bp.stage === "IDEA" || bp.stage === "SPEC")) {
    await db.buildPlan.update({
      where: { id: bp.id },
      data: { stage: "SCAFFOLDED", repoUrl, scaffoldedAt: new Date() },
    });
  } else if (!bp) {
    await db.buildPlan.create({
      data: { productId: product.id, stage: "SCAFFOLDED", repoUrl, scaffoldedAt: new Date() },
    });
  }

  rmSync(tmpParent, { recursive: true, force: true });

  console.log(`\n✓ Done`);
  console.log(`  repo:  ${repoUrl}`);
  if (demoUrl) console.log(`  demo:  ${demoUrl}`);
  console.log(`  bizfoo Product.repoUrl + Deliverable.url + BuildPlan.stage=SCAFFOLDED set.\n`);

  await db.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
