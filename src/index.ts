export { default as app } from "./app";
import app from "./app";

const PORT = 3000;

if (import.meta.env.PROD) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
