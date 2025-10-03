# README

## Todos

- Circle back to `web-app/package.json`. Might be able to remove a lot of the radix deps. Also...
  - Many of the imports need changed to reference the `ui` workspace.
  - Many of the `shadcn` components need migrated to the `ui` workspace.
- Consider adding storybook capability to the `ui` workspace
- Why is the eslint rule `turbo/no-undeclared-env-vars` only working in the db client file?
- Make sure to review the Turborepo best-practices outlined in [Add to an existing repository](https://turborepo.com/docs/getting-started/add-to-existing-repository#add-a-turbojson-file)
- Consider a prettier plugin or something that will auto-sort tailwind classes
- Investigate whether or not `transpilePackages: ["@web-app-template/ui"]` is really necessary in `next.config.ts`

## Misc

- Write a _Monorepo Guidelines and Best Practices_ doc so there's a clear mental model of how to add new packages and manage their dependencies
