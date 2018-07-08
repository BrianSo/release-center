import { Request, Response } from "express";
import Project from "../models/Project";
import { asyncHandler } from "../util/asyncHandler";

/**
 * GET /cms/projects
 * Projects home page
 */
export let index = asyncHandler(async (req: Request, res: Response) => {
  const projects = await Project.find();

  res.render("cms/projects/projects", {
    title: "Projects",
    projects: projects,
  });
});

/**
 * GET /cms/projects/create
 * Projects create page
 */
export let getCreate = (req: Request, res: Response) => {
  res.render("cms/projects/create", {
    title: "Crete project"
  });
};

/**
 * POST /cms/projects/create
 * Projects create action
 */
export let postCreate = asyncHandler(async (req: Request, res: Response) => {
  req.assert("id", "ID cannot be blank").notEmpty();
  req.assert("name", "Name cannot be blank").notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/cms/projects/create");
  }

  await Project.create({
    id: req.body.id,
    name: req.body.name,
    description: req.body.description
  });

  req.flash("success", { msg: `Success! Created Project ${req.body.id}` });
  res.redirect("/cms/projects");
});
