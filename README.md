# YeetServer Library

This library provides an implementation of an HTTP web server. It uses Node.js net and fs modules to create servers and handle filesystem obligations. The YeetServer class is the cornerstone of the library that you can use to initiate a new server and map HTTP methods (GET, POST, PUT, DELETE) to their respective handlers.

## Installation

Import the YeetServer module:

javascript
const { YeetServer } = require("./YeetServer");

## Usage

Initially, create a new instance of the YeetServer class:

javascript
const server = new YeetServer();

Next, define request handlers for HTTP methods and paths using `get`, `post`, `put`, and `delete` methods:

```javascript
server.get("/path", (request) => {
  /*...*/
});
server.post("/path", (request) => {
  /*...*/
});
server.put("/path", (request) => {
  /*...*/
});
server.delete("/path", (request) => {
  /*...*/
});
```

In the handler function, the handlers interact with a request object containing `path`, `headers`, and `body`. These handlers should return an object that provides the `status` code, `body` of the response, and any `headers` to be included.

```javascript
server.get("/path", (request) => {
  // Processing request...
  return {
    status: 200, // HTTP status code
    body: "Response body", // Respective response
    headers: { "Content-Type": "text/plain" }, // Any required headers
  };
});
```

If you want to handle requests to multiple paths with the same handler, you can use `*` as a wildcard in your path:

```javascript
server.get("/user/*", (request) => {
  /*...*/
});
```

This will match any GET request to paths like `/user/1`, `/user/profile`, etc.

Lastly, have your server listen on a specific port and hostname:

```javascript
server.listen(3000, "127.0.0.1");
```

The server will default to `127.0.0.1` if you only specify the port.

Note, in the case of an endpoint/handler not being defined, a fallback handler will be engaged, responding with a 404 status. You can also handle socket errors in your application using socket's "error" event.
