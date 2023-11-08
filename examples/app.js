const { YeetServer } = require("../src/yeet-server");
const { join } = require("node:path");
const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");

const server = new YeetServer();

const root = process.argv[process.argv.indexOf("--directory") + 1];

server.get("/files/*", async (req) => {
  const filePath = req.path.slice(7);
  const fullPath = join(root, filePath);

  if (existsSync(fullPath)) {
    const fileContent = await fs.readFile(fullPath);

    return {
      status: 200,
      body: Buffer.from(fileContent),
      headers: {
        "Content-Type": "application/octet-stream",
      },
    };
  } else {
    return {
      status: 404,
      body: `${fullPath} is not exsist`,
    };
  }
});

server.get("/user-agent", (req) => {
  const body = req.headers["User-Agent"];

  return {
    status: 200,
    body,
    headers: {
      "Content-Type": "text/plain",
    },
  };
});

server.get("/echo/*", (req) => {
  const body = req.path.slice(6);

  return {
    status: 200,
    body,
    headers: {
      "Content-Type": "text/plain",
    },
  };
});

server.get("/", (req, res) => {
  return {
    status: 200,
  };
});

server.post("/files/.*", async (req) => {
  const filePath = req.path.slice(7);
  const fullPath = join(root, filePath);

  if (existsSync(fullPath)) {
    const file = await fs.readFile(fullPath);
    const response = "File already exists";

    return {
      status: 503,
      body: response,
      headers: {
        "Content-Type": "text/plain",
      },
    };
  } else {
    await fs.writeFile(fullPath, req.body);

    return {
      status: 201,
    };
  }
});

server.listen({ port: 4221 });
