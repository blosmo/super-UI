import { entries } from "../scripts/jev/evidence.mjs";
import { traits, useCases } from "../src/lib/component-assessment.mjs";

export class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function validateRequest(body) {
  if (
    !body ||
    typeof body.query !== "string" ||
    !body.query.trim() ||
    body.query.length > 600
  )
    throw Error("Describe your task in 1 to 600 characters.");
  const filters = body.filters || {};
  if (typeof filters !== "object" || Array.isArray(filters))
    throw Error("Invalid filters");
  const allowed = {
    library: new Set(entries.map((e) => e.library)),
    category: new Set(entries.map((e) => e.category)),
    useCase: new Set(Object.keys(useCases)),
    style: new Set(Object.keys(traits.style.options)),
    motion: new Set(Object.keys(traits.motion.options)),
    setup: new Set(Object.keys(traits.setup.options)),
  };
  const clean = {};
  for (const [key, value] of Object.entries(filters)) {
    if (key === "savedIds") {
      if (
        !Array.isArray(value) ||
        value.length > 685 ||
        value.some((id) => !entries.some((e) => e.id === id))
      )
        throw Error("Invalid saved components");
      clean[key] = value;
      continue;
    }
    if (
      !allowed[key] ||
      typeof value !== "string" ||
      (value && !allowed[key].has(value))
    )
      throw Error("Invalid filters");
    if (value) clean[key] = value;
  }
  return { query: body.query.trim(), filters: clean };
}

// Each server owns its gates. HTTP and MCP searches use the same search gate.
export function createAdmissionGate({ perMinute, concurrency }) {
  const rates = new Map();
  let active = 0;
  return (ip) => {
    const now = Date.now();
    for (const [key, bucket] of rates)
      if (bucket.until <= now) rates.delete(key);
    if (!rates.has(ip) && rates.size >= 10000)
      throw new ServiceError(429, "Search is busy. Please try again shortly.");
    const bucket = rates.get(ip) || { count: 0, until: now + 60000 };
    rates.set(ip, bucket);
    if (++bucket.count > perMinute || active >= concurrency)
      throw new ServiceError(429, "Search is busy. Please try again shortly.");
    active++;
    let released = false;
    return () => {
      if (!released) active--;
      released = true;
    };
  };
}

export function createSearchService(search) {
  const admit = createAdmissionGate({ perMinute: 15, concurrency: 2 });
  return async (body, ip) => {
    let input;
    try {
      input = validateRequest(body);
    } catch {
      throw new ServiceError(
        400,
        "Use a task of 1 to 600 characters and valid catalog filters.",
      );
    }
    const release = admit(ip);
    try {
      return await search(input.query, input.filters);
    } catch {
      throw new ServiceError(
        503,
        "Intelligent search is unavailable. You can still search by component name in the catalog.",
      );
    } finally {
      release();
    }
  };
}
