# Valibot Fetch

`valibot-fetch` is a simple API for building a type and runtime-safe fetcher function using [valibot](https://github.com/fabian-hiller/valibot) schemas.
This library has a similar api design to [zod-fetch](https://github.com/mattpocock/zod-fetch), but uses [valibot](https://github.com/fabian-hiller/valibot) instead of [zod](https://github.com/colinhacks/zod) for smaller bundle size. [Valibot](https://github.com/fabian-hiller/valibot) can reduce the bundle size up to 98% compared to Zod as it is tree shakable.

## Usage

### Using the default fetcher

You can create a fetcher using `createValibotFetcher`:

```ts
import { object, litreal } from 'valibot'
import { createValibotFetcher } from 'valibot-fetch'

const fetchWithValibot = createValibotFetcher()

fetchWithValibot(
  // The schema you want to validate with
  object({
    hello: literal('world'),
  }),
  // Any parameters you would usually pass to fetch
  '/my-api'
).then((res) => {
  console.log(res)
  //          ^? { hello: 'world' }
})
```

If you don't pass a fetcher to `createValibotFetcher`, it uses a sensible default fetcher (using the `fetch` API) to grab the data needed.

### Using a custom fetcher

You can pass custom fetchers to `createValibotFetcher`:

```ts
import { object, string } from 'valibot'
import { createValibotFetcher } from 'valibot-fetch'
import axios from 'axios'

const fetchWithValibot = createValibotFetcher(axios.get)

fetchWithValibot(
  object({
    data: object({
      name: string(),
    }),
  }),
  '/user',
  {
    params: {
      id: 12345,
    },
  }
).then((res) => {
  console.log(res)
  //          ^? { data: { name: string } }
})
```

## Why does this exist?

For teams that want to combine runtime-safety with a fetcher (an extremely common use case), you often have a choice:

1. Use a big, all-encompassing solution like [tRPC](https://trpc.io/)
2. Hack something together on your own

I hope that this small API offers a nice compromise for teams looking to bridge that gap. Or, at least, offers some pretty example code you can copy-and-paste into your projects.

`valibot-fetch` only really exists because there's some TypeScript magic required to help `valibot` and `fetch` knit together nicely.
