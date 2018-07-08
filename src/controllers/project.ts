import { Request, Response } from "express";

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
    res.redirect("/cms/login");
};

/**
 * GET /cms
 * CMS Login Page
 */
export let getLogin = (req: Request, res: Response) => {
    res.render("cms/login", {
        title: "CMS"
    });
};

/**
 * GET /cms
 * CMS Login Page
 */
export let postLogin = (req: Request, res: Response) => {
    res.render("cms/login", {
        title: "CMS"
    });
};