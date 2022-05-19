import app from "$app";
import supertest from "supertest";

test("/hello-world should respond with Hello, World!", async () => {
  await supertest(app)
    .get("/hello-world")
    .expect(200)
    .expect({ message: "Hello, World!" });
});
