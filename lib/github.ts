// Tiny GitHub client for scaffolding repos from bizfoo.
// Uses GITHUB_PACKAGES_TOKEN (or GITHUB_TOKEN) — needs `repo` scope.

const TOKEN =
  process.env.GITHUB_TOKEN ?? process.env.GITHUB_PACKAGES_TOKEN ?? "";

const DEFAULT_OWNER =
  process.env.BIZFOO_GITHUB_OWNER ?? "bright-and-early";

function headers() {
  if (!TOKEN) throw new Error("GITHUB_TOKEN / GITHUB_PACKAGES_TOKEN not set");
  return {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    authorization: `Bearer ${TOKEN}`,
    "content-type": "application/json",
  };
}

export type CreateRepoInput = {
  name: string;
  description?: string;
  private?: boolean;
  owner?: string; // org login; if omitted, creates under the authed user
};

export async function ghCreateRepo(input: CreateRepoInput) {
  const owner = input.owner ?? DEFAULT_OWNER;
  const url = owner
    ? `https://api.github.com/orgs/${owner}/repos`
    : `https://api.github.com/user/repos`;

  let res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      private: input.private ?? true,
      auto_init: true,
    }),
  });

  // If the org endpoint 404s (login is a user, not an org), fall back.
  if (res.status === 404 && owner) {
    res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        private: input.private ?? true,
        auto_init: true,
      }),
    });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub repo create failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as {
    html_url: string;
    full_name: string;
    name: string;
    owner: { login: string };
  };
  return json;
}

export async function ghPutFile(opts: {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
}) {
  const res = await fetch(
    `https://api.github.com/repos/${opts.owner}/${opts.repo}/contents/${opts.path}`,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({
        message: opts.message,
        content: Buffer.from(opts.content).toString("base64"),
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub put-file failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Verifies the repo exists and is private. Throws otherwise. This is the
 * safety net against accidentally surfacing a public (source-leaked) repo
 * to a buyer through the invite flow.
 */
export async function ghEnsurePrivateRepo(opts: { owner: string; repo: string }) {
  const res = await fetch(
    `https://api.github.com/repos/${opts.owner}/${opts.repo}`,
    { headers: headers() },
  );
  if (!res.ok) {
    throw new Error(`GitHub repo lookup failed (${res.status})`);
  }
  const json = (await res.json()) as { private?: boolean };
  if (json.private !== true) {
    throw new Error(
      `Refusing to invite: repo ${opts.owner}/${opts.repo} is not private`,
    );
  }
}

/**
 * Add a GitHub user as a collaborator to a private repo. Used by the
 * GITHUB_INVITE delivery method on grant redemption. Always verifies the
 * repo is still private before issuing the invite.
 */
export async function ghInviteCollaborator(opts: {
  owner: string;
  repo: string;
  username: string;
  permission?: "pull" | "push" | "triage" | "maintain" | "admin";
}) {
  await ghEnsurePrivateRepo({ owner: opts.owner, repo: opts.repo });
  const res = await fetch(
    `https://api.github.com/repos/${opts.owner}/${opts.repo}/collaborators/${opts.username}`,
    {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ permission: opts.permission ?? "pull" }),
    },
  );
  // 201 = invitation created, 204 = already a collaborator
  if (res.status === 201) return (await res.json()) as { id: number; html_url: string };
  if (res.status === 204) return { id: 0, html_url: `https://github.com/${opts.owner}/${opts.repo}` };
  const text = await res.text().catch(() => "");
  throw new Error(`GitHub invite failed (${res.status}): ${text}`);
}
