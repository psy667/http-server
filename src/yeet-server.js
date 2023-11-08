const net = require("node:net");
const fs = require("node:fs/promises");

class YeetServer {
  #server;

  constructor() {
    this.#server = net.createServer((socket) => {
      socket.on("data", (data) => this.#onData(socket, data));
    });
  }

  #handlers = {
    POST: {},
    GET: {},
    PUT: {},
    DELETE: {},
  };

  get(path, handler) {
    this.#handlers["GET"][path] = handler;
  }

  post(path, handler) {
    this.#handlers["POST"][path] = handler;
  }

  put(path, handler) {
    this.#handlers["PUT"][path] = handler;
  }

  delete(path, handler) {
    this.#handlers["DELETE"][path] = handler;
  }

  listen(port, hostname = "127.0.0.1") {
    this.#server.listen(port, hostname);
  }

  #fallbackHandler() {
    return {
      status: 404,
      body: "",
    };
  }

  #statusMessages = {
    404: "Not Found",
    200: "OK",
  };

  #parseHeaders(rawHeaders) {
    return rawHeaders
      .filter(Boolean)
      .map((it) => it.split(": "))
      .reduce(
        (headersHashMap, [key, value]) => ({ ...headersHashMap, [key]: value }),
        {}
      );
  }

  async #handleRequest(method, path, headers, body) {
    const routeHandlerPath = Object.keys(this.#handlers[method]).find((it) =>
      new RegExp(it.replace("*", ".*") + "$", "g").test(path)
    );

    const routeHandler = this.#handlers[method][routeHandlerPath];

    let result;

    if (!routeHandler) {
      result = await this.#fallbackHandler(path);
    } else {
      result = await routeHandler({ path, headers, body });
    }

    return {
      status: result.status,
      body: result.body || "",
      headers: {
        ...result.headers,
        "Content-Length": result.body?.length ?? 0,
      },
    };
  }

  async #onData(socket, data) {
    const [startAndHeaders, requestBody] = data.toString().split("\r\n\r\n");
    const [startLine, ...headerLines] = startAndHeaders
      .toString()
      .split("\r\n");
    const [method, path, protocol] = startLine.split(" ");

    const response = await this.#handleRequest(
      method,
      path,
      this.#parseHeaders(headerLines),
      requestBody
    );

    const {
      headers: responseHeaders,
      body: responseBody,
      status: statusCode,
    } = response;

    const statusMessage = this.#statusMessages[statusCode] ?? "";

    const headersFormatted = Object.entries(response.headers).map(
      ([key, value]) => `${key}: ${value}`
    );

    const responseString = [
      `HTTP/1.1 ${statusCode} ${statusMessage}`,
      ...headersFormatted,
      ``,
      responseBody ?? null,
      ``,
    ]
      .filter((it) => it !== null)
      .join("\r\n");
    
    socket.write(responseString);

    socket.on("error", (err) => {
      console.error("error", err);
    });
  }
}

module.exports = { YeetServer };
