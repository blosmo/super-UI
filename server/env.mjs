import { readFileSync, existsSync } from "node:fs";
// Only explicitly supported server settings are read from local env files.
// Process environment takes precedence; never import this module from browser code.
export function serverEnv(name, fallback = "") {
  if (process.env[name] !== undefined) return process.env[name];
  if (
    ![
      "TYPESAFE_API_KEY",
      "SEARCH_DAILY_BUDGET_USD",
      "HOST",
      "PORT",
      "PUBLIC_URL",
    ].includes(name)
  )
    return fallback;
  for (const path of [".env.local", ".env"]) {
    if (!existsSync(path)) continue;
    const match = readFileSync(path, "utf8").match(
      new RegExp(
        "^" + name + "\\s*=\\s*[\"']?([^\\s\"'\\r\\n#]+)[\"']?\\s*(?:#.*)?$",
        "m",
      ),
    );
    if (match) return match[1];
  }
  return fallback;
}
