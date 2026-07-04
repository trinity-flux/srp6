# srp6 monorepo

Turborepo + pnpm workspace for [`@trinity-flux/srp6`](packages/srp6/README.md),
a TrinityCore-compatible SRP6 verifier library for node.js.

## Structure

- [`packages/srp6`](packages/srp6) — the published npm package (`@trinity-flux/srp6`)
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
```

## Releasing

Versions are managed with [Changesets](https://github.com/changesets/changesets):

1. In your feature branch, run `pnpm changeset` and describe the change
   (patch/minor/major). Commit the generated file under `.changeset/`.
2. When it lands on `main`, the [release workflow](.github/workflows/release.yml)
   opens/updates a **Version Packages** PR that bumps versions and changelogs.
3. Merging that PR publishes `@trinity-flux/srp6` to npm with provenance.
   Requires the `NPM_TOKEN` repository secret.

## License

Apache-2.0
