import "dotenv/config";
import { createServer } from "http";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // pakai "localhost" jika mau persis artikel
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const baseUrl = `http://${req.headers.host || `${hostname}:${port}`}`;
      const requestUrl = new URL(req.url, baseUrl);
      const { pathname } = requestUrl;
      const query = Object.fromEntries(requestUrl.searchParams);
      const parsedUrl = { pathname, query };

      if (pathname === "/a") {
        await app.render(req, res, "/a", query);
      } else if (pathname === "/b") {
        await app.render(req, res, "/b", query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(dev);
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
