import { Request, Response } from "express";

/**
 * GET /cms
 * CMS home page
 */
export let index = (req: Request, res: Response) => {
  res.render("cms/projects/projects", {
    title: "Projects"
  });
};
