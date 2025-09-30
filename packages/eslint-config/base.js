import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import turboPlugin from "eslint-plugin-turbo"
import onlyWarn from "eslint-plugin-only-warn"
import tseslint from "typescript-eslint"

/**
 * Universal linting defaults for any package in the monorepo.
 *
 * @type {import("eslint").Linter.FlatConfig[]}
 */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.{js,ts,mjs,cjs}",
    ],
  },
]

export default config
