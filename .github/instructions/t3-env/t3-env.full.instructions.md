# T3 Env Readme - Typesafe Envs made Simple

![NPM Version](https://img.shields.io/npm/v/%40t3-oss%2Fenv-core)
[![JSR](https://jsr.io/badges/@t3-oss/env-core)](https://jsr.io/@t3-oss/env-core)
[![JSR Score](https://jsr.io/badges/@t3-oss/env-core/score)](https://jsr.io/@t3-oss/env-core)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@t3-oss/env-core)](https://socket.dev/npm/package/@t3-oss/env-core/overview)

Deploying your app with invalid environment variables is a hassle. This package helps you to avoid that.

> For full documentation, see https://env.t3.gg

## Installation

> [!NOTE]
>
> This is an ESM only package that requires a tsconfig with a module resolution that can read package.json#exports (`NodeNext` if transpiling with `tsc`, `Bundler` if using a bundler).

```bash
 # npm
 npm i @t3-oss/env-nuxt

 # pnpm
 pnpm add @t3-oss/env-nuxt

 # bun
 bun add @t3-oss/env-nuxt

 # deno
 deno add jsr:@t3-oss/env-nuxt
```

## Usage

> [!NOTE]
>
> You may use any Standard Schema compliant validator of your choice. This example uses Zod

This package supports the full power of Zod/Valibot etc, meaning you can use `transforms` and `default` values.

### Define your schema

```ts
// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs" // or core package
import { z } from "zod"

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
})
```

### Use the schema in your app with autocompletion and type inference

```ts
// src/app/hello/route.ts
import { env } from "../env.mjs"

export const GET = (req: Request) => {
  const DATABASE_URL = env.DATABASE_URL
  // use it...
}
```

export const metadata = {
title: "Introduction",
description:
"Forgetting environment variables during build can be a hassle and difficult to debug if a bug is caused by a missing environment variable. This package provides a simple way to define environment variables validation for your app.",
};

# T3 Env

Forgetting environment variables during build can be a hassle and difficult to debug if a bug is caused by a missing environment variable. This package provides a simple way to define environment variables validation for your app.

This library does all the grunt work for you, simply define your schema and use your environment variables safely.

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Link } from "next-view-transitions";

<Link href="/docs/core" className={cn(buttonVariants(), "mt-4")}>
  Take me to the installation!
</Link>

## Rationale

For a while, we've had validated environment variables in [create-t3-app](https://create.t3.gg) which has been super appreciated by the community. However, the code was quite scary and lived in user land which caused some confusion for new users. This library aims to move that complexity into a library that abstracts the implementation details and lets the user focus on just the necessary parts. It also allows other framework and stacks to benefit from the same validation strategy - which we've polished over a number of iterations up until now.

## Advantages over simpler solutions

Validating envs are quite easy and can be done in a few lines of code. You can also infer the result from the validation onto your `process.env` object to benefit from autocompletion throughout your application. [Matt Pocock](https://www.youtube.com/watch?v=q1im-hMlKhM) did a video explaining how you can implement this approach:

```ts
import { z } from "zod"

const envVariables = z.object({
  DATABASE_URL: z.string(),
  CUSTOM_STUFF: z.string(),
})

envVariables.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
```

However, it has a few drawbacks that this library solves:

### Transforms and Default values

Since the above implementation doesn't mutate the `process.env` object, any transforms applied will make your types lie to you, as the type will be of the transformed type, but the value on `process.env` will be the original string. You also cannot apply default values to your environment variables which can be useful in some cases.

By having an object you import and use throughout the application, you can use both of the above which unlocks some quite powerful features.

### Support for multiple environments

By default, some frameworks (e.g. Next.js) treeshake away unused environment variables unless you explicitly access them on the `process.env` object. This means that the above implementation would fail even if you export and use the `envVariables` object in your application, as no environment will be included in the bundle for some environments / runtimes.

Another pitfall is client side validation. Importing `envVariables` on the client will throw an error as the server side environment variables `DATABASE_URL` & `CUSTOM_STUFF` is not defined on the client. This library solves this issue by using a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) based implementation combined with Zod's `safeParse` method instead of `parse`.

<Callout type="info">

We're not leaking your server variables onto the client. Your server variables will be undefined on the client, and attempting to access one will throw a descriptive error message to ease debugging:

![invalid access](https://user-images.githubusercontent.com/51714798/234414211-33d9a91d-4bd7-42ff-a4af-1e101ee8cd93.png)

</Callout>

export const metadata = {
title: "Core",
description:
"Get started with the framework agnostic core package of T3 Env.",
};

# Core

The core package can be used in any framework of your choice. To use it, figure out what prefix your framework uses for exposing environment variables to the client. For example, Astro uses `PUBLIC_`, while Vite uses `VITE_`. You should be able to find this in the frameworks documentation.

<Steps>

### Install dependencies

First, install the core package:

```bash
npm install @t3-oss/env-core zod

# or using JSR
deno add jsr:@t3-oss/env-core
```

<Callout>

Although we'll use Zod as examples throughout these docs, you can use any validator that supports [Standard Schema](https://github.com/standard-schema/standard-schema).

</Callout>

<Callout>

`@t3-oss/env-core` requires a minimum of `typescript@5.0.0`.

</Callout>

<Callout>

`@t3-oss/env-core` is an ESM only package. Make sure that your tsconfig uses a module resolution that can read `package.json#exports` (`Bundler` is recommended).

</Callout>

### Create your schema

Then, you can create your schema like so:

<Callout>

The file below is named `env.ts`, but you can name it whatever you want. Some frameworks even generate a `env.d.ts` file that will collide with `env.ts`, which means you will have to name it something else.

</Callout>

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  client: {
    PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
```

Remove the `clientPrefix` and `client` properties if you only want the environment variables to exist on the server.

<Callout type="warning">

While defining both the client and server schemas in a single file provides the best developer experience,
it also means that your validation schemas for the server variables will be shipped to the client.
If you consider the **names** of your variables sensitive, you should split your schemas into two files.

```ts title="src/env/server.ts"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
})
```

```ts title="src/env/client.ts"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  client: {
    PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
})
```

</Callout>

For all available options, see [Customization](/docs/customization).

You'll notice that if your `clientPrefix` is `PUBLIC_`, you won't be allowed to enter any other keys in the `client` object without getting type-errors. Below you can see we get a descriptive error when we set `VITE_PUBLIC_API_URL` instead of `PUBLIC_API_URL`:

![invalid client prefix](https://user-images.githubusercontent.com/51714798/234410449-271d7afe-b541-45bf-acaa-134cbec4c51a.png)

This client prefix is also enforced at runtime to make sure validation works on both the server and client.

### Validate schema on build (recommended)

The steps required to validate your schema on build will vary from framework to framework, but you'll usually be able to import the env file in your configuration file, or in any file that's pulled in the beginning of the build process.

Note that some frameworks don't import their environment variables in their configuration file.

### Use your schema

Then, import the `env` object in your application and use it, taking advantage of type-safety and auto-completion:

```ts title="some-api-endpoint.ts"
import { env } from "~/env" // On server

export const GET = async () => {
  // do fancy ai stuff
  const magic = await fetch("...", {
    headers: { Authorization: env.OPEN_AI_API_KEY },
  })
  // ...
}
```

</Steps>

## Additional strictness for `runtimeEnv`

<Callout type="info">

Exactly one of `runtimeEnv` and `runtimeEnvStrict` should be specified.

</Callout>

If your framework doesn't bundle all environment variables by default, but instead only bundles the ones you use, you can use the `runtimeEnvStrict` option to make sure you don't forget to add any variables to your runtime.

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },
  client: {
    PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
  },
  /**
   * Makes sure you explicitly access **all** environment variables
   * from `server` and `client` in your `runtimeEnv`.
   */
  runtimeEnvStrict: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    PUBLIC_PUBLISHABLE_KEY: process.env.PUBLIC_PUBLISHABLE_KEY,
  },
})
```

When using the strict option, missing any of the variables in `runtimeEnvStrict` will result in a type error:

![missing runtimeEnv](https://user-images.githubusercontent.com/51714798/234409775-fee3edbd-a73b-415a-829f-28f6f6092707.png)

export const metadata = {
title: "Next.js",
description: "Next.js integration for T3 Env",
};

# Next.js

The Next.js package comes preconfigured for Next.js and also enforces some extra rules by default to make sure you have out-of-the-box compatibility in all different Next.js runtimes.

<Steps>

### Install dependencies

Install the required dependencies:

```bash
pnpm add @t3-oss/env-nextjs zod

# or using JSR
deno add jsr:@t3-oss/env-nextjs
```

<Callout>

Although we'll use Zod as examples throughout these docs, you can use any validator that supports [Standard Schema](https://github.com/standard-schema/standard-schema).

</Callout>

<Callout>

`@t3-oss/env-nextjs` requires a minimum of `typescript@5.0.0`.

</Callout>

<Callout>

`@t3-oss/env-nextjs` is an ESM only package. Make sure that your tsconfig uses a module resolution that can read `package.json#exports` (`Bundler` is recommended).

</Callout>

### Create your schema

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
})
```

<Callout type="info">

Unlike in the core package, `runtimeEnv` is strict by default, meaning you'll have to destructure all the keys manually. This is due to how Next.js bundles environment variables and only explicitly accessed variables are included in the bundle. Missing keys will result in a type-error:

![missing runtimeEnv](https://user-images.githubusercontent.com/51714798/234409775-fee3edbd-a73b-415a-829f-28f6f6092707.png)

</Callout>

<Callout type="warning">

While defining both the client and server schemas in a single file provides the best developer experience,
it also means that your validation schemas for the server variables will be shipped to the client.
If you consider the **names** of your variables sensitive, you should split your schemas into two files.

```ts title="src/env/server.ts"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    OPEN_AI_API_KEY: z.string().min(1),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  // runtimeEnv: {
  //   DATABASE_URL: process.env.DATABASE_URL,
  //   OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
  // },
  // For Next.js >= 13.4.4, you can just reference process.env:
  experimental__runtimeEnv: process.env,
})
```

```ts title="src/env/client.ts"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
})
```

</Callout>

<Callout type="info">

If you're using the `standalone` output in your `next.config.ts`, make sure to include the following:

```ts title="next.config.ts"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  // Add the packages in transpilePackages
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
}

export default nextConfig
```

</Callout>

### Validate schema on build (recommended)

We recommend you importing your newly created file in your `next.config.js`. This will make sure your environment variables are validated at build time which will save you a lot of time and headaches down the road. You can use [unjs/jiti](https://github.com/unjs/jiti) to import TypeScript files in your `next.config.js`:

```js title="next.config.js" {6}
import { fileURLToPath } from "node:url"
import createJiti from "jiti"
const jiti = createJiti(fileURLToPath(import.meta.url))

// Import env here to validate during build. Using jiti@^1 we can import .ts files :)
jiti("./app/env")

/** @type {import('next').NextConfig} */
export default {
  /** ... */
}
```

We do not recommend using `next.config.ts` as it does not support loading ESM.

### Use your schema

Then, import the `env` object in your application and use it, taking advantage of type-safety and auto-completion:

```ts title="some-api-endpoint.ts"
import { env } from "~/env" // On server

export const GET = async () => {
  // do fancy ai stuff
  const magic = await fetch("...", {
    headers: { Authorization: env.OPEN_AI_API_KEY },
  })
  // ...
}
```

```ts title="some-component.tsx"
import { env } from "~/env"; // On client - same import!

export const SomeComponent = () => {
  return (
    <SomeProvider publishableKey={env.PUBLIC_PUBLISHABLE_KEY}>
      {/* ... */}
    </SomeProvider>
  );
};
```

</Steps>

export const metadata = {
title: "Recipes",
description: "Recipes for common use cases",
};

# Recipes

`t3-env` supports the full power of Zod meaning you can use transforms, default values etc. to create a set of powerful and flexible validation schemas for your environment variables. Below we'll look at a few example recipes for

<Callout>
  All environment variables are strings, so make sure that the first `ZodType`
  is a `z.string()`. This will be enforced on type-level in the future.
</Callout>

## Booleans

Coercing booleans from strings is a common use case. Below are 2 examples of how to do this, but you can choose any coercian logic you want.

Zod's default primitives coercion should not be used for booleans, since every string gets coerced to true.

```ts
export const env = createEnv({
  server: {
    COERCED_BOOLEAN: z
      .string()
      // transform to boolean using preferred coercion logic
      .transform((s) => s !== "false" && s !== "0"),

    ONLY_BOOLEAN: z
      .string()
      // only allow "true" or "false"
      .refine((s) => s === "true" || s === "false")
      // transform to boolean
      .transform((s) => s === "true"),
  },
  // ...
})
```

## Numbers

Coercing numbers from strings is another common use case.

```ts
export const env = createEnv({
  server: {
    SOME_NUMBER: z
      .string()
      // transform to number
      .transform((s) => parseInt(s, 10))
      // make sure transform worked
      .pipe(z.number()),

    // Alternatively, use Zod's default primitives coercion
    // https://zod.dev/?id=coercion-for-primitives
    ZOD_NUMBER_COERCION: z.coerce.number(),
  },
  // ...
})
```

## Storybook

[Storybook](https://storybook.js.org/) uses its own bundler, which is otherwise
unaware of `t3-env` and won't call into `runtimeEnv` to ensure that the environment
variables are present. You can use Storybook's support for defining environment
variables separately to ensure that all environment variables are actually
available for Storybook:

```ts
// .storybook/main.ts

import { env as t3Env } from "~/env/client.mjs"

const config: StorybookConfig = {
  // other Storybook config...
  env: (config1) => ({
    ...config1,
    ...t3Env,
  }),
}

export default config
```

export const metadata = {
title: "Customization",
description:
"Learn how to customize the library to suit your needs by overriding the default behaviors.",
};

# Customization

Below are some examples of how you can customize the behavior of the library. The default values are shown in the snippets below.

## Skipping validation

<Callout type="warning">

Skipping validation is not encouraged and will lead to your types and runtime values being out of sync. It is available to let you opt out of validation during linting (or similar), or if you're building with Docker and not all environment variables are present when building the image.

</Callout>

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"

export const env = createEnv({
  // ...
  // Tell the library to skip validation if condition is true.
  skipValidation: false,
})
```

## Overriding the default error handler

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"

export const env = createEnv({
  // ...
  // Called when the schema validation fails.
  onValidationError: (issues: StandardSchemaV1.Issue[]) => {
    console.error("❌ Invalid environment variables:", issues)
    throw new Error("Invalid environment variables")
  },
  // Called when server variables are accessed on the client.
  onInvalidAccess: (variable: string) => {
    throw new Error(
      "❌ Attempted to access a server-side environment variable on the client",
    )
  },
})
```

## Tell when we're in a server context

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"

export const env = createEnv({
  // ...
  // Tell the library when we're in a server context.
  isServer: typeof window === "undefined",
})
```

## Treat empty strings as undefined

By default, T3 Env will feed the environment variables directly to the Zod validator. This means that if you have an empty string for a value that is supposed to be a number (e.g. `PORT=` in a ".env" file), Zod will flag
it as a type mismatch violation. Additionally, if you have an empty string for a value that is supposed to be a string with a default value (e.g. `DOMAIN=`in an ".env" file), the default value will never be applied. In order to solve these issues, you can set the`emptyStringAsUndefined`option to`true`.

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"

export const env = createEnv({
  // ...
  // Treat empty strings as undefined.
  emptyStringAsUndefined: false,
})
```

## Extending presets

Your env object may extend other presets by using the `extends` property. This can be used to include system environment variables for your deployment provider, or if you have a monorepo with multiple packages that share some environment variables.

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"
import { vercel } from "@t3-oss/env-core/presets-zod"

export const env = createEnv({
  // ...
  // Extend the Vercel preset.
  extends: [vercel()],
})

env.VERCEL_URL // string
```

T3 Env ships the following presets out of the box, all importable from the `/presets` entrypoint.

- `vercel` - Vercel environment variables. See full list [here](https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables).
- `neonVercel` - Neon provided system environment variables when using the Vercel integration. See full list [here](https://neon.tech/docs/guides/vercel-native-integration#environment-variables-set-by-the-integration).
- `supabaseVercel` - Supabase provided system environment variables when using the Vercel integration. See full list [here](https://vercel.com/marketplace/supabase).
- `uploadthing` - All environment variables required to use [UploadThing](https://uploadthing.com/). More info [here](https://docs.uploadthing.com/getting-started/appdir#add-env-variables).
- `render` - Render environment variables. See full list [here](https://docs.render.com/environment-variables#all-runtimes).
- `railway` - Railway provided system environment variables. See full list [here](https://docs.railway.app/reference/variables#railway-provided-variables).
- `fly.io` - Fly.io provided machine runtime environment variables. See full list [here](https://fly.io/docs/machines/runtime-environment/#environment-variables).
- `netlify` - Netlify provided system environment variables. See full list [here](https://docs.netlify.com/configure-builds/environment-variables).
- `upstashRedis` - Upstash Redis environment variables. More info [here](https://upstash.com/docs/redis/howto/connectwithupstashredis).
- `coolify` - Coolify environment variables. More info [here](https://coolify.io/docs/knowledge-base/environment-variables#predefined-variables).
- `vite` - Vite environment variables. More info [here](https://vite.dev/guide/env-and-mode).
- `wxt` - WXT environment variables. More info [here](https://wxt.dev/guide/essentials/config/environment-variables.html#built-in-environment-variables).

<Callout type="info">
  Feel free to open a PR with more presets!
</Callout>

A preset is just like any other env object, so you can easily create your own:

```ts
// packages/auth/env.ts
import { createEnv } from "@t3-oss/env-core"
export const env = createEnv({
  // ...
})

// apps/web/env.ts
import { createEnv } from "@t3-oss/env-nextjs"
import { env as authEnv } from "@repo/auth/env"

export const env = createEnv({
  // ...
  extends: [authEnv],
})
```

## Further refinement or transformation

You can use the `createFinalSchema` option to further refine or transform the environment variables.

```ts title="src/env.ts"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    SKIP_AUTH: z.boolean().optional(),
    EMAIL: z.string().email().optional(),
    PASSWORD: z.string().min(1).optional(),
  },
  // ...
  createFinalSchema: (shape, isServer) =>
    z.object(shape).transform((env, ctx) => {
      if (env.SKIP_AUTH || !isServer) return { SKIP_AUTH: true } as const
      if (!env.EMAIL || !env.PASSWORD) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "EMAIL and PASSWORD are required if SKIP_AUTH is false",
        })
        return z.NEVER
      }
      return {
        EMAIL: env.EMAIL,
        PASSWORD: env.PASSWORD,
      }
    }),
})
```
