import { env } from "./config/env";
import { app } from "./app";

if (env.NODE_ENV === "development") {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

export default app;
