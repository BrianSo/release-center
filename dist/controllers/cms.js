"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const APIKey_1 = __importDefault(require("../models/APIKey"));
const asyncHandler_1 = require("../util/asyncHandler");
const crypto_1 = __importDefault(require("crypto"));
/**
 * GET /
 * Home page.
 */
exports.indexRedirect = (req, res) => {
    res.redirect("/cms");
};
/**
 * GET /cms
 * CMS home page
 */
exports.index = (req, res) => {
    if (req.user) {
        res.redirect("/cms/projects");
    }
    else {
        res.redirect("/cms/login");
    }
};
/**
 * GET /cms/login
 * CMS Login Page
 */
exports.getLogin = (req, res) => {
    res.render("cms/login", {
        title: "CMS"
    });
};
/**
 * POST /cms/login
 * CMS Login Page
 */
exports.postLogin = (req, res, next) => {
    req.assert("email", "Email is not valid").isEmail();
    req.assert("password", "Password cannot be blank").notEmpty();
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });
    const errors = req.validationErrors();
    if (errors) {
        req.flash("errors", errors);
        return res.redirect("/cms/project");
    }
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("errors", info.message);
            return res.redirect("/cms/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", { msg: "Success! You are logged in." });
            res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};
/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
    req.logout();
    res.redirect("/");
};
exports.getAPIKeys = asyncHandler_1.asyncHandler(async (req, res) => {
    const apiKeys = await APIKey_1.default.find();
    res.render("cms/apikeys/list", {
        title: "API Keys",
        apiKeys
    });
});
exports.getCreateAPIKeys = asyncHandler_1.asyncHandler(async (req, res) => {
    res.render("cms/apikeys/edit", {
        title: "API Keys",
        isCreate: true,
        apiKey: {}
    });
});
exports.postCreateAPIKeys = asyncHandler_1.asyncHandler(async (req, res) => {
    req.assert("name", "Name is required").notEmpty();
    req.assert("projectId", "Project ID is required").notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        req.flash("errors", errors);
        return res.redirect(req.originalUrl);
    }
    const apiKey = await APIKey_1.default.create({
        name: req.body.name,
        projectId: req.body.projectId,
        key: crypto_1.default.randomBytes(32).toString("base64")
    });
    req.flash("success", { msg: `Success! Created ${req.body.name} API Key: ${apiKey.key}` });
    res.redirect("/cms/api_keys");
});
//# sourceMappingURL=cms.js.map