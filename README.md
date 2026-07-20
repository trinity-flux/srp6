# srp6 monorepo

Turborepo + pnpm workspace for [`@trinity-flux/srp6`](packages/srp6/README.md),
a TrinityCore-compatible SRP6 verifier library for node.js.

## Structure

- [`packages/srp6`](packages/srp6) — the published npm package (`@trinity-flux/srp6`)
- [`apps/docs`](apps/docs) — Docusaurus documentation site
  ([trinity-flux.github.io/srp6](https://trinity-flux.github.io/srp6/))
- [`examples/sample`](examples/sample) — usage examples (in-memory and MySQL/TrinityCore `auth` DB)

## Development

Everything is TypeScript, linted/formatted with [Biome](https://biomejs.dev),
and orchestrated with [Turborepo](https://turborepo.com).

```sh
pnpm install
pnpm build       # turbo run build
pnpm test        # turbo run test
pnpm typecheck   # turbo run typecheck
pnpm lint        # biome check .
pnpm lint:fix    # biome check --write .
pnpm format      # biome format --write .

pnpm start:sample    # run the in-memory example
pnpm start:sampledb  # run the MySQL example (requires a TrinityCore auth DB)

pnpm --filter @trinity-flux/docs dev  # docs site at http://localhost:3000/srp6/
```

## Releasing

Versions are managed with [Changesets](https://github.com/changesets/changesets):

1. In your feature branch, run `pnpm changeset` and describe the change
   (patch/minor/major). Commit the generated file under `.changeset/`.
2. When it lands on `main`, the [release workflow](.github/workflows/release.yml)
   opens/updates a **Version Packages** PR that bumps versions and changelogs.
3. Merging that PR publishes `@trinity-flux/srp6` to npm with provenance.

### npm authentication

Publishing uses **npm trusted publishing (OIDC)** — no secrets, nothing to
rotate. The package is configured on npmjs.com with *Publishing access:
"Require two-factor authentication and disallow tokens"*, so token-based
publishing is rejected by the registry and OIDC is the only supported path.

The trust relationship is registered under the package's *Settings → Trusted
Publisher* as: organization `trinity-flux`, repository `srp6`, workflow
`release.yml`. **Renaming or moving this workflow file breaks publishing** —
update the trusted publisher entry first.

OIDC requires npm >= 11.5.1, so the workflow installs it explicitly (Node 22
still bundles npm 10.x, which silently falls back to token auth and fails
with `ENEEDAUTH`). The "Report npm auth mode" step logs the versions and the
auth mode in use.

## License

Apache-2.0
