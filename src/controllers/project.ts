import { Request, Response } from "express";
import Project, { ProjectModel } from "../models/Project";
import Release from "../models/Release";
import { asyncHandler } from "../util/asyncHandler";
import multer from "multer";
import compose from "connect-compose";
import path from "path";
import fs from "fs-extra";
import { STORAGE_DIRECTORY } from "../config/directory";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const result = path.join(STORAGE_DIRECTORY, `upload/${req.params.id}`);
    fs.ensureDir(result, err => {
      if (err) {
        cb(err, undefined);
      } else {
        cb(undefined, result);
      }
    });
  },
  filename: function (req, file, cb) {
    cb(undefined, file.originalname + "-" + new Date().toISOString());
  }
});
const upload = multer({ storage });


const getProject = async (projectId: string): Promise<ProjectModel> => {
  return await Project.findOne({
    id: projectId
  }).populate("main")
    .populate("android")
    .populate("ios");
};

/**
 * GET /cms/projects
 * Projects home page
 */
export let index = asyncHandler(async (req: Request, res: Response) => {
  const projects = await Project.find()
    .populate("main")
    .populate("android")
    .populate("ios");

  console.log(projects);

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

export let getCMSProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await getProject(req.params.id);
  await project.populateReleases();

  res.render("cms/projects/project", {
    title: project.name,
    project: project,
  });
});

export let getCreateRelease = asyncHandler(async (req: Request, res: Response) => {
  const project = await getProject(req.params.id);

  res.render("cms/projects/createRelease", {
    title: project.name,
    project: project,
  });
});

export let postCreateRelease = compose([
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    req.body.file = req.file;
    req.assert("name", "Name is required").notEmpty();
    req.assert("track", "Track is required").notEmpty();
    req.assert("file", "File is required").exists();

    const errors = req.validationErrors();

    if (errors) {
      req.flash("errors", errors);
      return res.redirect(`/cms/projects/${req.params.id}/releases/create`);
    }

    const release = await Release.create({
      projectId: req.params.id,
      name: req.body.name,
      note: req.body.note,
      track: req.body.track,
      fileName: req.file.originalname,
      mimetype: req.file.mimetype,
      path: req.file.path,
    });

    if (["android", "ios", "main"].indexOf(req.body.track) !== -1) {
      await Project.update({
        id: req.params.id
      }, {
        [req.body.track]: release._id
      });
    }

    res.redirect(`/cms/projects/${req.params.id}`);
  })
]);

export let downloadRelease = asyncHandler(async (req: Request, res: Response) => {
  const release = await Release.findById(req.params.releaseId);

  res.setHeader("Content-disposition", `attachment; filename=${release.fileName}`);
  res.setHeader("Content-type", release.mimetype);
  fs.createReadStream(release.path).pipe(res);
});
