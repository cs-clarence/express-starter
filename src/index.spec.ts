import app from "$app";
import supertest from "supertest";

test("/ should respond with Hello, World!", async () => {
  await supertest(app)
    .get("/")
    .expect(200)
    .expect({ message: "Hello, World!" });
});
