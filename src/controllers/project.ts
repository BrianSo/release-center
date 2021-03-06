import {NextFunction, Request, Response} from "express";
import Project, { ProjectModel } from "../models/Project";
import Release from "../models/Release";
import { asyncHandler } from "../util/asyncHandler";
import multer from "multer";
import compose from "connect-compose";
import path from "path";
import fs from "fs-extra";
import { STORAGE_DIRECTORY } from "../config/directory";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../util/errors";
import plist from "plist";

const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    const result = path.join(STORAGE_DIRECTORY, `upload/${req.params.id || req.body.id}`);
    fs.ensureDir(result, err => {
      if (err) {
        cb(err, undefined);
      } else {
        cb(undefined, result);
      }
    });
  },
  filename: function (req, file, cb) {
    cb(undefined, req.fileName || (file.originalname + "-" + new Date().toISOString()));
  }
});
const upload = multer({ storage });


const retrieveProject = async (projectId: string): Promise<ProjectModel> => {
  const project = await Project.findOne({
    id: projectId
  });
  if (!project) {
    throw new NotFoundError("Project Not found");
  }
  return project;
};

/**
 * GET /cms/projects
 * Projects home page
 */
export let getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await Project.find()
    .populate("main")
    .populate("android")
    .populate("ios");

  if (req.isAPICall) {
    res.json(projects.map((project: ProjectModel) => project.toJSON()));
  } else {
    res.render("cms/projects/projects", {
      title: "Projects",
      projects: projects,
    });
  }
});

/**
 * GET /cms/projects/create
 * Projects create page
 */
export let getCreate = (req: Request, res: Response) => {
  res.render("cms/projects/edit", {
    isCreate: true,
    title: "Create project",
    project: {},
  });
};

/**
 * POST /cms/projects/create
 * Projects create action
 */
export let postCreate = compose([
  (req, res, next) => { req.fileName = "icon"; next(); },
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    req.assert("id", "ID cannot be blank").notEmpty();
    req.assert("name", "Name cannot be blank").notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      if (req.isAPICall) {
        throw new BadRequestError(errors[0].msg);
      } else {
        req.flash("errors", errors);
        return res.redirect("/cms/projects/create");
      }
    }

    try {
      const project = await Project.create({
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        iosBundleId: req.body.iosBundleId,
        tracks: req.body.tracks || [],
        image: (!!req.file) ? `/${req.body.id}/image` : null,
      });

      if (req.isAPICall) {
        res.json(project.toJSON());
      } else {
        req.flash("success", { msg: `Success! Created Project ${req.body.id}` });
        res.redirect("/cms/projects");
      }
    } catch (e) {
      if (e && e.code === 11000) {
        throw new ConflictError("Project Already exists");
      } else {
        throw e;
      }
    }

  })
]);


export let getEdit = asyncHandler(async (req: Request, res: Response) => {
  const project = await Project.findOne({
    id: req.params.id
  });
  res.render("cms/projects/edit", {
    isCreate: false,
    title: `Edit ${req.params.id}`,
    project,
  });
});

export let postEdit = compose([
  (req, res, next) => { req.fileName = "icon"; next(); },
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    req.assert("id", "ID cannot be blank").notEmpty();
    req.assert("name", "Name cannot be blank").notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      if (req.isAPICall) {
        throw new BadRequestError(errors[0].msg);
      } else {
        req.flash("errors", errors);
        return res.redirect("/cms/projects/create");
      }
    }

    const update : any = {
      name: req.body.name,
      description: req.body.description,
      tracks: req.body.tracks || [],
      iosBundleId: req.body.iosBundleId,
    };
    if (req.file) {
      update.image = `/${req.params.id}/image`;
    }
    const project = await Project.findOneAndUpdate({
      id: req.params.id,
    }, update);

    if (req.isAPICall) {
      res.json(project.toJSON());
    } else {
      req.flash("success", { msg: `Success! Edited Project ${req.params.id}` });
      res.redirect(`/cms/projects/${req.params.id}`);
    }

  })
]);

export let getCMSProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await retrieveProject(req.params.id);
  await project.populateReleases();

  res.render("cms/projects/project", {
    title: project.name,
    project: project,
  });
});

export let getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await retrieveProject(req.params.id);
  await project.populateReleases();

  if (req.isAPICall) {
    res.json(project.toJSON());
  } else {
    res.render("projects/project", {
      title: project.name,
      project: project,
    });
  }
});

/**
 * GET /projects/:id/releases/latest
 */
export let getProjectLatestRelease = asyncHandler(async (req: Request, res: Response) => {
  const project = await retrieveProject(req.params.id);
  await project.populateReleases();

  const result = {};

  for(const track of project.tracks) {
    result[track] = project.releases[track][0];
  }

  res.json(result);
});

export let getCreateRelease = asyncHandler(async (req: Request, res: Response) => {
  const project = await retrieveProject(req.params.id);

  res.render("cms/projects/editRelease", {
    isCreate: true,
    title: project.name,
    project: project,
    release: {},
  });
});

export let getEditRelease = asyncHandler(async (req: Request, res: Response) => {
  const project = await retrieveProject(req.params.id);
  const release = await Release.findById(req.params.releaseId);

  res.render("cms/projects/editRelease", {
    isCreate: false,
    title: project.name,
    project: project,
    release: release,
  });
});

export let postCreateRelease = compose([
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    req.assert("name", "Name is required").notEmpty();
    req.assert("track", "Track is required").notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      if (req.isAPICall) {
        throw new BadRequestError(errors[0].msg);
      } else {
        req.flash("errors", errors);
        return res.redirect(`/cms/projects/${req.params.id}/releases/create`);
      }
    }

    let isIOS = false;
    if (req.file) {
      if (/\.ipa$/.test(req.file.originalname)) {
        isIOS = true;
      }
    }

    const release = await Release.create({
      projectId: req.params.id,
      name: req.body.name,
      note: req.body.note,
      track: req.body.track,
      fileName: req.file && req.file.originalname,
      mimetype: req.file && req.file.mimetype,
      path: req.file && req.file.path,
      isIOS: isIOS,
    });

    if (req.isAPICall) {
      res.json(release.toJSON());
    } else {
      req.flash("success", { msg: `Success! Created Release ${req.body.name}` });
      res.redirect(`/cms/projects/${req.params.id}`);
    }
  })
]);

export let postEditRelease = compose([
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    req.assert("name", "Name is required").notEmpty();
    req.assert("track", "Track is required").notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      if (req.isAPICall) {
        throw new BadRequestError(errors[0].msg);
      } else {
        req.flash("errors", errors);
        return res.redirect(`/cms/projects/${req.params.id}/releases/edit`);
      }
    }

    const updates: any = {
      name: req.body.name,
      note: req.body.note,
      track: req.body.track,
    };

    if (req.file) {
      updates.fileName = req.file.originalname;
      updates.mimetype = req.file.mimetype;
      updates.path = req.file.path;
      updates.isIOS = /\.ipa$/.test(req.file.originalname);
    }

    const release = await Release.findByIdAndUpdate(req.params.releaseId, updates);

    if (req.isAPICall) {
      res.json(release.toJSON());
    } else {
      res.redirect(`/cms/projects/${req.params.id}`);
    }
  })
]);

export let deleteRelease = asyncHandler(async (req: Request, res: Response) => {
  await Release.deleteOne({
    _id: req.params.releaseId
  });
  res.redirect(`/cms/projects/${req.params.id}`);
});

export let downloadRelease = asyncHandler(async (req: Request, res: Response) => {
  const release = await Release.findById(req.params.releaseId);

  const stat = await fs.stat(release.path);

  res.setHeader("Content-Disposition", `attachment; filename=${release.fileName}`);
  res.setHeader("Content-Type", release.mimetype);
  res.setHeader("Content-Length", stat.size);
  const stream = fs.createReadStream(release.path);
  stream.on("error", (err) => next(err));
  stream.pipe(res);
});

export let releaseIOSPlist = asyncHandler(async (req: Request, res: Response) => {
  const release = await Release.findById(req.params.releaseId);
  const project = await Project.findOne({ id: release.projectId });
  res.setHeader("Content-Disposition", "filename=download.plist");
  res.setHeader("Content-Type", "application/x-plist");

  const plistJson = {
    items: [
      {
        assets: [
          {
            kind: "software-package",
            url: `${process.env.SERVER_ADDRESS}/${project.id}/download/${release.id}`,
          }
        ],
        metadata: {
          "bundle-identifier": project.iosBundleId,
          "bundle-version": release.name,
          "kind": "software",
          "title": project.name
        },
      }
    ]
  };
  if (project.image) {
    plistJson.items[0].assets.push({
      kind: "display-image",
      "need-shine": false,
      url: `${process.env.SERVER_ADDRESS}/${project.id}/image`,
    });
  }

  res.send(plist.build(plistJson));
});

export let getProjectImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const imagePath = path.join(STORAGE_DIRECTORY, `upload/${req.params.id}/icon`);
  const stream = fs.createReadStream(imagePath);
  stream.on("error", (err) => next(err));
  stream.pipe(res);
});
