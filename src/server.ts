import { env } from "./config/env";
import app from "./app";

const isDevelopment = env.NODE_ENV === "development";
if (isDevelopment) {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${env.PORT}`);
  });
}

export default app;
