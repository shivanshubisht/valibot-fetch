import { type BaseSchema, type Output, parse } from 'valibot'
/**
 * A type representing a fetcher function that can be
 * passed to createValibotFetcher.
 */
export type AnyFetcher = (...args: any[]) => any

/**
 * A type utility which represents the function returned
 * from createValibotFetcher
 */
export type ValibotFetcher<TFetcher extends AnyFetcher> = <
  TSchema extends BaseSchema
>(
  schema: TSchema,
  ...args: Parameters<TFetcher>
) => Promise<Output<TSchema>>

/**
 * The default fetcher used by createValibotFetcher when no
 * fetcher is provided.
 */
export const defaultFetcher = async (...args: Parameters<typeof fetch>) => {
  const response = await fetch(...args)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

/**
 * Creates a `fetchWithValibot` function that takes in a schema of
 * the expected response, and the arguments to fetch.
 *
 * Since you didn't provide a fetcher in `createValibotFetcher()`,
 * we're falling back to the default fetcher.
 *
 * @example
 *
 * import { object, string } from 'valibot'
 *
 * const fetchWithValibot = createValibotFetcher();
 *
 * const response = await fetchWithValibot(
 *   object({
 *     hello: string(),
 *   }),
 *   "https://example.com",
 * );
 */
export function createValibotFetcher(): ValibotFetcher<typeof fetch>

/**
 * Creates a `fetchWithValibot` function that takes in a schema of
 * the expected response, and the arguments to the fetcher
 * you provided.
 *
 * @example
 *
 * import { object, string } from 'valibot'
 *
 * const fetchWithValibot = createValibotFetcher((url) => {
 *   return fetch(url).then((res) => res.json());
 * });
 *
 * const response = await fetchWithValibot(
 *   object({
 *     hello: string(),
 *   }),
 *   "https://example.com",
 * );
 */
export function createValibotFetcher<TFetcher extends AnyFetcher>(
  /**
   * A fetcher function that returns the data you'd like to parse
   * with the schema.
   */
  fetcher: TFetcher
): ValibotFetcher<TFetcher>
export function createValibotFetcher(
  fetcher: AnyFetcher = defaultFetcher
): ValibotFetcher<any> {
  return async (schema, ...args) => {
    const response = await fetcher(...args)
    return parse(schema, response)
  }
}
