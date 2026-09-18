import { randomUUID } from "node:crypto";

// Reserve atomically before calling the provider. Missing responses retain their
// reservation; settlement is idempotent. Redis TIME gives all instances one day.
const reserveScript = `
local day = math.floor(tonumber(redis.call('TIME')[1]) / 86400)
local key = KEYS[1] .. ':' .. day
local amount = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local used = tonumber(redis.call('HGET', key, 'total') or '0')
if used + amount > limit then return {} end
redis.call('HINCRBYFLOAT', key, 'total', amount)
redis.call('HSET', key, ARGV[3], amount)
redis.call('EXPIRE', key, 172800)
return {key, ARGV[3]}
`;
const settleScript = `
local amount = redis.call('HGET', KEYS[1], ARGV[1])
if not amount then return 0 end
redis.call('HINCRBYFLOAT', KEYS[1], 'total', tonumber(ARGV[2]) - tonumber(amount))
redis.call('HDEL', KEYS[1], ARGV[1])
return 1
`;

export function createRedisBudgetLedger({
  url,
  token,
  limit,
  price,
  namespace = "super-ui:search-budget:v1",
  fetcher = fetch,
}) {
  async function run(script, key, args) {
    if (!url || !token || !url.startsWith("https://"))
      throw Error("Shared search budget is not configured");
    const response = await fetcher(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", script, "1", key, ...args.map(String)]),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw Error("Shared search budget is unavailable");
    const data = await response.json();
    if (data.error) throw Error("Shared search budget failed");
    return data.result;
  }
  return {
    async reserve(body) {
      const amount = (Buffer.byteLength(body) * 2 + 2048) * price;
      if (
        !Number.isFinite(limit) ||
        limit <= 0 ||
        !Number.isFinite(amount) ||
        amount <= 0
      )
        throw Error("Invalid search budget");
      const id = randomUUID();
      const result = await run(reserveScript, namespace, [amount, limit, id]);
      if (
        !Array.isArray(result) ||
        result.length !== 2 ||
        result[1] !== id ||
        !String(result[0]).startsWith(namespace + ":")
      )
        throw Error("Search budget reached or unavailable");
      return { key: result[0], id };
    },
    async settle(reservation, tokens) {
      if (
        !Number.isFinite(tokens) ||
        tokens < 0 ||
        !Number.isFinite(tokens * price)
      )
        throw Error("Invalid usage");
      const result = await run(settleScript, reservation.key, [
        reservation.id,
        tokens * price,
      ]);
      if (result !== 0 && result !== 1)
        throw Error("Invalid budget settlement");
    },
  };
}
