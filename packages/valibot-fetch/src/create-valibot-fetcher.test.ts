import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import 'isomorphic-fetch'
import { createValibotFetcher } from '.'
import { number, object, string, ValiError } from 'valibot'

const server = setupServer()
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('Should create a default fetcher', async () => {
  server.use(
    rest.get('https://example.com', (req, res, ctx) => {
      return res(ctx.json({ hello: 'world' }), ctx.status(200))
    })
  )

  const fetchWithValibot = createValibotFetcher()

  const response = await fetchWithValibot(
    object({
      hello: string(),
    }),
    'https://example.com'
  )

  expect(response).toEqual({
    hello: 'world',
  })
})

it('Should throw an error with mis-matched schemas with a default fetcher', async () => {
  server.use(
    rest.get('https://example.com', (req, res, ctx) => {
      return res(ctx.json({ hello: 'world' }), ctx.status(200))
    })
  )

  const fetchWithValibot = createValibotFetcher()

  await expect(
    fetchWithValibot(
      object({
        hello: number(),
      }),
      'https://example.com'
    )
  ).rejects.toMatchObject(
    new ValiError([
      {
        reason: 'type',
        validation: 'number',
        origin: 'value' as const,
        message: 'Invalid type',
        input: 1,
      },
    ])
  )
})

it('Should throw an error if response is not ok with the default fetcher', async () => {
  server.use(
    rest.get('https://example.com', (req, res, ctx) => {
      return res(
        ctx.json({
          error: 'Invalid permissions',
        }),
        ctx.status(403)
      )
    })
  )

  const fetchWithValibot = createValibotFetcher()

  await expect(
    fetchWithValibot(
      object({
        hello: number(),
      }),
      'https://example.com'
    )
  ).rejects.toMatchInlineSnapshot('[Error: Request failed with status 403]')
})

it('Should handle successes with custom fetchers', async () => {
  const fetcher = createValibotFetcher(async () => {
    return fetch('https://example.com').then((res) => res.json())
  })

  server.use(
    rest.get('https://example.com', (req, res, ctx) => {
      return res(ctx.json({ hello: 'world' }), ctx.status(200))
    })
  )

  const response = await fetcher(
    object({
      hello: string(),
    })
  )

  expect(response).toEqual({
    hello: 'world',
  })
})
