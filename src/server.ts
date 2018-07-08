import errorHandler from "errorhandler";

import app from "./app";
import { bootstrap } from "./app";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

bootstrap().then(() => {
  /**
   * Start Express server.
   */
  const server = app.listen(app.get("port"), () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });
});
