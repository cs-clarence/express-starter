const { default: express } = await import("express");

const app = express();

app.get("/hello-world", (_req, res) => res.send("Hello, World!"));

export default app;
