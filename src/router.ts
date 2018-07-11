import passport from "passport";
import { Router } from "express";
// Controllers (route handlers)
import * as projectController from "./controllers/project";
import * as cmsController from "./controllers/cms";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import * as apiAuthorization from "./middlewares/apiAuthorization";

const app = Router();

/**
 * Primary app routes.
 */
app.get("/", cmsController.indexRedirect);
app.get("/cms", cmsController.index);
app.get("/cms/login", cmsController.getLogin);
app.post("/cms/login", cmsController.postLogin);
app.get("/cms/logout", cmsController.logout);
app.get("/cms/account", cmsController.getAccount);
app.post("/cms/account/profile", cmsController.postUpdateProfile);
app.post("/cms/account/password", cmsController.postUpdatePassword);

app.use("/cms/api_keys", passportConfig.isAuthenticated);
{
  app.get("/cms/api_keys", cmsController.getAPIKeys);
  app.get("/cms/api_keys/create", cmsController.getCreateAPIKeys);
  app.post("/cms/api_keys/create", cmsController.postCreateAPIKeys);
}

const projectCMS = Router();
app.use(
    "/cms/projects",
    passportConfig.isAuthenticated,
    projectCMS,
);
projectCMS.get("/", projectController.index);
projectCMS.get("/create", projectController.getCreate);
projectCMS.post("/create", projectController.postCreate);
projectCMS.get("/:id", projectController.getCMSProject);
projectCMS.get("/:id/edit", projectController.getEdit);
projectCMS.post("/:id/edit", projectController.postEdit);
projectCMS.get("/:id/releases/create", projectController.getCreateRelease);
projectCMS.post("/:id/releases/create", projectController.postCreateRelease);
projectCMS.get("/:id/releases/:releaseId/edit", projectController.getEditRelease);
projectCMS.post("/:id/releases/:releaseId/edit", projectController.postEditRelease);
projectCMS.get("/:id/releases/:releaseId/delete", projectController.deleteRelease);

const apiRouter = Router();
app.use(
  "/api",
  (req, res, next) => { req.isAPICall = true; next(); },
  apiRouter,
);

apiRouter.get("/projects/:id", projectController.getProject);
apiRouter.get("/projects/:id/releases/latest", projectController.getProjectLatestRelease);
apiRouter.get("/projects/:id/releases/:releaseId/download", projectController.downloadRelease);

// below require API Key
const authorizedApiRouter = Router();
apiRouter.use(
  apiAuthorization.isAuthorized,
  authorizedApiRouter
);
authorizedApiRouter.post("/projects", apiAuthorization.isAuthorizedForProject, projectController.postCreate);
authorizedApiRouter.patch("/projects/:id", apiAuthorization.isAuthorizedForProject, projectController.postEdit);
authorizedApiRouter.post("/projects/:id/releases", apiAuthorization.isAuthorizedForProject, projectController.postCreateRelease);
authorizedApiRouter.patch("/projects/:id/releases/:releaseId", apiAuthorization.isAuthorizedForProject, projectController.postEditRelease);

app.get("/:id", projectController.getProject);
app.get("/:id/download/:releaseId", projectController.downloadRelease);

//
// app.get("/logout", userController.logout);
// app.get("/forgot", userController.getForgot);
// app.post("/forgot", userController.postForgot);
// app.get("/reset/:token", userController.getReset);
// app.post("/reset/:token", userController.postReset);
// app.get("/signup", userController.getSignup);
// app.post("/signup", userController.postSignup);
// app.get("/contact", contactController.getContact);
// app.post("/contact", contactController.postContact);
// app.get("/account", passportConfig.isAuthenticated, userController.getAccount);
// app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
// app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
// app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
// app.get("/account/unlink/:provider", passportConfig.isAuthenticated, userController.getOauthUnlink);
//
// /**
//  * API examples routes.
//  */
// app.get("/api", apiController.getApi);
// app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
//
// /**
//  * OAuth authentication routes. (Sign in)
//  */
// app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
// app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
//     res.redirect(req.session.returnTo || "/");
// });

export default app;
