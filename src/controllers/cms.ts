import { Request, Response, NextFunction } from "express";
import passport from "passport";
import {default as User, UserModel} from "../models/User";
import { IVerifyOptions } from "passport-local";
import APIKey from "../models/APIKey";
import { asyncHandler } from "../util/asyncHandler";
import crypto from "crypto";
import {WriteError} from "mongodb";
import {is} from "immutable";

/**
 * GET /
 * Home page.
 */
export let indexRedirect = (req: Request, res: Response) => {
  res.redirect("/cms");
};

/**
 * GET /cms
 * CMS home page
 */
export let index = (req: Request, res: Response) => {
  if (req.user) {
    res.redirect("/cms/projects");
  } else {
    res.redirect("/cms/login");
  }
};

/**
 * GET /cms/login
 * CMS Login Page
 */
export let getLogin = (req: Request, res: Response) => {
  res.render("cms/login", {
    title: "CMS"
  });
};

/**
 * POST /cms/login
 * CMS Login Page
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password cannot be blank").notEmpty();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/cms/project");
  }

  passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("errors", info.message);
      return res.redirect("/cms/login");
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/");
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
  req.logout();
  res.redirect("/");
};

export let getAPIKeys = asyncHandler(async (req: Request, res: Response) => {
  const apiKeys = await APIKey.find();
  res.render("cms/apikeys/list", {
    title: "API Keys",
    apiKeys
  });
});

export let getCreateAPIKeys = asyncHandler(async (req: Request, res: Response) => {
  res.render("cms/apikeys/edit", {
    title: "API Keys",
    isCreate: true,
    apiKey: {}
  });
});

export let postCreateAPIKeys = asyncHandler(async (req: Request, res: Response) => {
  req.assert("name", "Name is required").notEmpty();
  req.assert("projectId", "Project ID is required").notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect(req.originalUrl);
  }

  const apiKey = await APIKey.create({
    name: req.body.name,
    projectId: req.body.projectId,
    key: crypto.randomBytes(32).toString("base64")
  });
  req.flash("success", { msg: `Success! Created ${req.body.name} API Key: ${apiKey.key}` });
  res.redirect("/cms/api_keys");
});

/**
 * GET /cms/account
 * Profile page.
 */
export let getAccount = (req: Request, res: Response) => {
  res.render("cms/account/profile", {
    title: "Account Management"
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export let postUpdateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Please enter a valid email address.").isEmail();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/cms/account");
  }

  const user = await User.findById(req.user.id);
  user.email = req.body.email || "";
  try{
    await user.save();
    req.flash("success", { msg: "Profile information has been updated." });
    res.redirect("/cms/account");
  } catch (err: WriteError) {
    if (err.code === 11000) {
      req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
      return res.redirect("/cms/account");
    }
    throw err;
  }
});

/**
 * POST /account/password
 * Update current password.
 */
export let postUpdatePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  req.assert("oldPassword", "Current Password is required").notEmpty();
  req.assert("password", "Password must be at least 4 characters long").len({ min: 4 });
  req.assert("confirmPassword", "Passwords do not match").equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/cms/account");
  }
  const user = await User.findById(req.user.id);
  const isPasswordMatch = await new Promise((res, rej) => {
    user.comparePassword(req.body.oldPassword, (err, isPasswordMatch) => {
      if (err)
        return rej(err);
      res(isPasswordMatch);
    });
  });
  if (!isPasswordMatch) {
    req.flash("errors", [{ msg: "Current password not match" }]);
    return res.redirect("/cms/account");
  }

  user.password = req.body.password;
  await user.save();
  req.flash("success", { msg: "Password has been changed." });
  res.redirect("/cms/account");
});
