import express from "express";
import cookieParser from "cookie-parser";
import { routes } from "./routes";
import { errorHandler } from "./middleware/error-handler";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

app.get("/api", (_, res) => {
  res.send(`Welcome to the Backend Starter!`);
});

app.use("/api/v1", routes);

app.use(errorHandler);
