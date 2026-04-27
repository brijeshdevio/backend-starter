import { env } from "./config/env";
import { app } from "./app";
import { logger } from "./lib/logger";

if (env.NODE_ENV === "development") {
  app.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT} in development mode`);
  });
}

export default app;
