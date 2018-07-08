import passport from "passport";
import { Router } from "express";
// Controllers (route handlers)
import * as projectController from "./controllers/project";
import * as cmsController from "./controllers/cms";
import * as userController from "./controllers/user";
import * as apiController from "./controllers/api";
import * as contactController from "./controllers/contact";


// API keys and Passport configuration
import * as passportConfig from "./config/passport";

const app = Router();

/**
 * Primary app routes.
 */
app.get("/", cmsController.indexRedirect);
app.get("/cms", cmsController.index);
app.get("/cms/login", cmsController.getLogin);
app.post("/cms/login", cmsController.postLogin);
app.get("/cms/logout", cmsController.logout);

const projectCMS = Router();
app.use(
    "/cms/projects",
    passportConfig.isAuthenticated,
    projectCMS,
);
projectCMS.get("/", projectController.index);
projectCMS.get("/create", projectController.index);
projectCMS.post("/create", projectController.index);
projectCMS.get("/{id}", projectController.index);
projectCMS.get("/{id}", projectController.index);
projectCMS.patch("/{id}", projectController.index);
projectCMS.get("/{id}/releases", projectController.index);
projectCMS.get("/{id}/releases/create", projectController.index);
projectCMS.post("/{id}/releases/create", projectController.index);
projectCMS.get("/{id}/releases/{version}/edit", projectController.index);
projectCMS.patch("/{id}/releases/{version}", projectController.index);

app.get("/{id}", projectController.index);

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
