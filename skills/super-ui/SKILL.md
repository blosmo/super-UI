---
name: super-ui
description: Find, compare, and inspect React components from the Super UI catalog when choosing UI for a concrete interaction or product need.
---

# Super UI component discovery

Use the connected Super UI tools `search_components` and `get_component`. Tool names may have a client-specific prefix. The service is a discovery catalog, not an automatic installer.

Describe the user's intended interaction in a short search query, including meaningful style or motion preferences. Honor their named libraries and framework constraints. Start with a small shortlist (typically 3 to 5); use the tool schema's filter values rather than inventing categories. Do not send private application code or secrets in a query. When server-side Jev ranking is enabled, the query and public source evidence go to TypeSafe.

Compare results using their fit explanations, dependencies, license, and preview links. Semantic matches are not Jev-ranked recommendations. Source-based assessments are AI judgments, not measured accessibility, performance, or quality certifications. Missing assessment data is unknown.

Call `get_component` for a selected result before integrating it. The response contains verified, possibly truncated excerpts and upstream references, not a complete installation bundle. A source hash identifies the full vendored file, not necessarily the excerpt. Read upstream usage instructions and required shared imports/styles before editing. Preserve attribution and license notices. Prefer the user's existing UI conventions and verify the actual integrated interaction in their app.

If the user asked only to find or compare components, provide a concise shortlist with preview links. If they already requested implementation, continue with the chosen component using the agent's normal editing and verification tools; do not add a routine approval step.

If MCP is unavailable but the user has supplied a Super UI base URL, read `/llms.txt`, search through `POST /api/search`, join result IDs against `/catalog.json`, and retrieve details through `GET /api/components/<URL-encoded-id>`. Do not assume a public Super UI domain. Without a connected service or supplied URL, explain that connection is required. Respect retry delays and surface an unavailable search instead of inventing results.
