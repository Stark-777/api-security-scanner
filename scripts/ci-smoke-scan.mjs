import { spawn } from "node:child_process";
import { createServer } from "node:http";

const server = createServer((_request, response) => {
  response.writeHead(200, {
    "content-type": "application/json"
  });
  response.end(JSON.stringify({ ok: true }));
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

try {
  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("Failed to resolve local smoke server address.");
  }

  const url = `http://127.0.0.1:${address.port}/health`;
  const result = await new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["dist/cli/index.js", "scan", "--url", url, "--fail-on", "high"],
      {
        env: {
          ...process.env,
          HTTP_PROXY: "",
          HTTPS_PROXY: "",
          NO_PROXY: "127.0.0.1,localhost",
          http_proxy: "",
          https_proxy: "",
          no_proxy: "127.0.0.1,localhost"
        },
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
  });

  if (result.status !== 2) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(
      `Expected CI smoke scan to exit with code 2, received ${result.status ?? "null"}.`
    );
  }

  process.stdout.write("CI smoke scan verified --fail-on high exit code 2.\n");
} finally {
  await new Promise((resolve) => {
    server.close(resolve);
  });
}
