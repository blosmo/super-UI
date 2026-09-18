import { mkdir, readFile, writeFile, rename, rmdir } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
export function createBudgetLedger(path, limit, price) {
  async function update(change) {
    await mkdir(dirname(path), { recursive: true });
    const lock = path + ".lock";
    let acquired = false;
    for (let i = 0; i < 100; i++) {
      try {
        await mkdir(lock);
        acquired = true;
        break;
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    }
    if (!acquired) throw Error("Search budget is busy");
    try {
      const today = new Date().toISOString().slice(0, 10);
      let ledger = { date: today, reservedUSD: 0 };
      try {
        const stored = JSON.parse(await readFile(path, "utf8"));
        if (stored.date === today) ledger = stored;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (!Number.isFinite(ledger.reservedUSD) || ledger.reservedUSD < 0)
        throw Error("Invalid budget ledger");
      const value = change(ledger);
      const temporary = path + "." + randomUUID() + ".tmp";
      await writeFile(temporary, JSON.stringify(ledger));
      await rename(temporary, path);
      return value;
    } finally {
      await rmdir(lock);
    }
  }
  return {
    reserve: (body) =>
      update((ledger) => {
        const amount = (Buffer.byteLength(body) * 2 + 2048) * price;
        if (
          !Number.isFinite(limit) ||
          limit <= 0 ||
          ledger.reservedUSD + amount > limit
        )
          throw Error("Search budget reached");
        ledger.reservedUSD += amount;
        return { amount, date: ledger.date };
      }),
    settle: (reservation, tokens) =>
      update((ledger) => {
        if (ledger.date !== reservation.date) return;
        if (!Number.isFinite(tokens) || tokens < 0)
          throw Error("Invalid usage");
        ledger.reservedUSD = Math.max(
          0,
          ledger.reservedUSD - reservation.amount + tokens * price,
        );
      }),
  };
}
