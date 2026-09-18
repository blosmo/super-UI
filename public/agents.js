const endpoint = `${location.origin}/mcp`;
const client = document.getElementById("client");
const code = document.getElementById("config");
const status = document.getElementById("status");
function update() {
  code.textContent =
    client.value === "codex"
      ? `codex mcp add super-ui --url ${endpoint}`
      : client.value === "json"
        ? JSON.stringify(
            { mcpServers: { "super-ui": { url: endpoint } } },
            null,
            2,
          )
        : endpoint;
  status.textContent = "";
}
client.addEventListener("change", update);
document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = "Copied";
  } catch {
    status.textContent = "Select and copy the text above.";
  }
});
update();
