# Development workflow

Boobstrap uses `dev` as the shared integration branch and `master` as the production branch in both repositories:

- [`mikeroq/boobstrap`](https://github.com/mikeroq/boobstrap): website, documentation, and playground.
- [`mikeroq/boobstrap-framework`](https://github.com/mikeroq/boobstrap-framework): published CSS framework and optional JavaScript adapters.

## Branch flow

1. Start each task from the latest `dev` branch in the repository being changed.
2. Work on a short-lived `agent/<description>` or feature branch.
3. Open a pull request into `dev` and merge only after CI passes.
4. Use the hosted dev site for integration and visual review.
5. Promote a tested release by merging framework `dev` into `master`, publishing one npm release, updating the site to that pinned release, and then merging site `dev` into `master`.

Do not publish interim npm versions for normal development and do not push task work directly to `dev` or `master`.

## Testing the framework branch locally

The normal dependency remains the production package pinned in `package-lock.json`. To replace it in `node_modules` with the current framework `dev` branch without changing either manifest, run:

```bash
npm ci
npm run framework:dev
npm run dev
```

`npm run framework:dev` installs the exact framework commit recorded in `.framework-dev-ref`. Running `npm ci` again restores the pinned production package.

After framework work merges into `boobstrap-framework:dev`, advance the integration pointer from the site repository:

```bash
npm ci
npm run framework:sync
git add .framework-dev-ref
git commit -m "Sync framework dev"
```

The sync command resolves the current framework `dev` head, records its full commit SHA, and installs it locally for immediate testing. Push that commit through the normal site PR flow into `dev`; the changed pointer invalidates the Docker layer and triggers a reliable preview deployment.

The framework repository has a `prepare` script, so npm builds its distributable files when installing it from Git. Git must be available on the machine performing the install.

## Nashboard dev service

Create a second Nashboard deployment alongside the production `boobstrap` service with these settings:

| Setting | Value |
| --- | --- |
| Name | `boobstrap-dev` |
| Project | `boobstrap` |
| Source | Git |
| Repository | `https://github.com/mikeroq/boobstrap.git` |
| Branch | `dev` |
| Deploy method | Dockerfile |
| Dockerfile | `./Dockerfile.dev` |
| Build context | `.` |
| Container port | `3000` |
| Environment | Development |
| Health check | `/` |
| Auto-deploy | Enabled |
| Suggested domain | `dev.boobstrap.org` |

`Dockerfile.dev` installs the framework commit in `.framework-dev-ref` directly from Git after the locked site dependencies, then builds the site. Production continues to use `Dockerfile` and the npm version pinned in `package-lock.json`.

Nashboard auto-deploys this service when the site `dev` branch changes. A framework-only push does not match the site's repository webhook, so the `.framework-dev-ref` sync commit is the explicit cross-repository integration point. This avoids a floating, cache-sensitive build and leaves an auditable record of the exact framework previewed. The sync PR can be automated later with a narrowly scoped GitHub App or repository-dispatch workflow.

## Release order

1. Freeze merges into both `dev` branches.
2. Verify the hosted dev site and both repositories' CI.
3. Merge `boobstrap-framework:dev` into `master`.
4. Tag and publish the framework once through its release workflow.
5. Update `@boobstrap/boobstrap` and `package-lock.json` on the site `dev` branch.
6. Confirm the site CI now passes against the published package.
7. Merge `boobstrap:dev` into `master`; production deploys from the normal `Dockerfile`.
8. Merge `master` back into `dev` in both repositories before resuming feature work.
