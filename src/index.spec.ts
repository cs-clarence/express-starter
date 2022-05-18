import app from "./app";
import supertest from "supertest";

test("/hello-world should respond with Hello, World!", (done) => {
  supertest(app)
    .get("/hello-world")
    .expect(200)
    .expect("Hello, World!")
    .end(done);
});
