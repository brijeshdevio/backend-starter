import express from "express";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api", (_, res) => {
  res.send(`Welcome to the Backend Starter!`);
});
