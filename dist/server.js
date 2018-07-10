"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const app_1 = __importDefault(require("./app"));
const app_2 = require("./app");
app_1.default.use(errorHandler_1.default);
app_2.bootstrap().then(() => {
    /**
     * Start Express server.
     */
    const server = app_1.default.listen(app_1.default.get("port"), () => {
        console.log("  App is running at http://localhost:%d in %s mode", app_1.default.get("port"), app_1.default.get("env"));
        console.log("  Press CTRL-C to stop\n");
    });
});
//# sourceMappingURL=server.js.map