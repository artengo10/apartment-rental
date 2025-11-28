// server/index.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Инициализируем Socket.IO
  const { initializeSocket } = require("../lib/socket-server");
  initializeSocket(server);

  const PORT = process.env.PORT || 3001;

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Socket.IO server ready on http://localhost:${PORT}`);
  });
});
