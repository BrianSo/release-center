"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Project_1 = __importDefault(require("../models/Project"));
const Release_1 = __importDefault(require("../models/Release"));
const asyncHandler_1 = require("../util/asyncHandler");
const multer_1 = __importDefault(require("multer"));
const connect_compose_1 = __importDefault(require("connect-compose"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const directory_1 = require("../config/directory");
const errors_1 = require("../util/errors");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const result = path_1.default.join(directory_1.STORAGE_DIRECTORY, `upload/${req.params.id}`);
        fs_extra_1.default.ensureDir(result, err => {
            if (err) {
                cb(err, undefined);
            }
            else {
                cb(undefined, result);
            }
        });
    },
    filename: function (req, file, cb) {
        cb(undefined, req.fileName || (file.originalname + "-" + new Date().toISOString()));
    }
});
const upload = multer_1.default({ storage });
const retrieveProject = async (projectId) => {
    const project = await Project_1.default.findOne({
        id: projectId
    });
    if (!project) {
        throw new errors_1.NotFoundError("Project Not found");
    }
    return project;
};
/**
 * GET /cms/projects
 * Projects home page
 */
exports.index = asyncHandler_1.asyncHandler(async (req, res) => {
    const projects = await Project_1.default.find()
        .populate("main")
        .populate("android")
        .populate("ios");
    res.render("cms/projects/projects", {
        title: "Projects",
        projects: projects,
    });
});
/**
 * GET /cms/projects/create
 * Projects create page
 */
exports.getCreate = (req, res) => {
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
exports.postCreate = connect_compose_1.default([
    (req, res, next) => { req.fileName = "icon"; next(); },
    upload.single("file"),
    asyncHandler_1.asyncHandler(async (req, res) => {
        req.assert("id", "ID cannot be blank").notEmpty();
        req.assert("name", "Name cannot be blank").notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            if (req.isAPICall) {
                throw new errors_1.BadRequestError(errors[0].msg);
            }
            else {
                req.flash("errors", errors);
                return res.redirect("/cms/projects/create");
            }
        }
        try {
            const project = await Project_1.default.create({
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                tracks: req.body.tracks || [],
            });
            if (req.isAPICall) {
                res.json(project.toJSON());
            }
            else {
                req.flash("success", { msg: `Success! Created Project ${req.body.id}` });
                res.redirect("/cms/projects");
            }
        }
        catch (e) {
            if (e && e.code === 11000) {
                throw new errors_1.ConflictError("Project Already exists");
            }
            else {
                throw e;
            }
        }
    })
]);
exports.getEdit = asyncHandler_1.asyncHandler(async (req, res) => {
    const project = await Project_1.default.findOne({
        id: req.params.id
    });
    res.render("cms/projects/edit", {
        isCreate: false,
        title: `Edit ${req.params.id}`,
        project,
    });
});
exports.postEdit = connect_compose_1.default([
    (req, res, next) => { req.fileName = "icon"; next(); },
    upload.single("file"),
    asyncHandler_1.asyncHandler(async (req, res) => {
        req.assert("id", "ID cannot be blank").notEmpty();
        req.assert("name", "Name cannot be blank").notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            if (req.isAPICall) {
                throw new errors_1.BadRequestError(errors[0].msg);
            }
            else {
                req.flash("errors", errors);
                return res.redirect("/cms/projects/create");
            }
        }
        const project = await Project_1.default.findOneAndUpdate({
            id: req.params.id,
        }, {
            name: req.body.name,
            description: req.body.description,
            tracks: req.body.tracks || [],
            image: (!!req.file) ? `/${req.params.id}/image` : null,
        });
        if (req.isAPICall) {
            res.json(project.toJSON());
        }
        else {
            req.flash("success", { msg: `Success! Edited Project ${req.params.id}` });
            res.redirect(`/cms/projects/${req.params.id}`);
        }
    })
]);
exports.getCMSProject = asyncHandler_1.asyncHandler(async (req, res) => {
    const project = await retrieveProject(req.params.id);
    await project.populateReleases();
    res.render("cms/projects/project", {
        title: project.name,
        project: project,
    });
});
exports.getProject = asyncHandler_1.asyncHandler(async (req, res) => {
    const project = await retrieveProject(req.params.id);
    await project.populateReleases();
    if (req.isAPICall) {
        res.json(project.toJSON());
    }
    else {
        res.render("projects/project", {
            title: project.name,
            project: project,
        });
    }
});
/**
 * GET /projects/:id/releases/latest
 */
exports.getProjectLatestRelease = asyncHandler_1.asyncHandler(async (req, res) => {
    const project = await retrieveProject(req.params.id);
    await project.populateReleases();
    const result = {};
    for (const track of project.tracks) {
        result[track] = project.releases[track][0];
    }
    res.json(result);
});
exports.getCreateRelease = asyncHandler_1.asyncHandler(async (req, res) => {
    const project = await retrieveProject(req.params.id);
    res.render("cms/projects/editRelease", {
        isCreate: true,
        title: project.name,
        project: project,
        release: {},
    });
});
exports.getEditRelease = asyncHandler_1.asyncHandler(async (req, res) => {
    const project = await retrieveProject(req.params.id);
    const release = await Release_1.default.findById(req.params.releaseId);
    res.render("cms/projects/editRelease", {
        isCreate: false,
        title: project.name,
        project: project,
        release: release,
    });
});
exports.postCreateRelease = connect_compose_1.default([
    upload.single("file"),
    asyncHandler_1.asyncHandler(async (req, res) => {
        req.assert("name", "Name is required").notEmpty();
        req.assert("track", "Track is required").notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            if (req.isAPICall) {
                throw new errors_1.BadRequestError(errors[0].msg);
            }
            else {
                req.flash("errors", errors);
                return res.redirect(`/cms/projects/${req.params.id}/releases/create`);
            }
        }
        const release = await Release_1.default.create({
            projectId: req.params.id,
            name: req.body.name,
            note: req.body.note,
            track: req.body.track,
            fileName: req.file && req.file.originalname,
            mimetype: req.file && req.file.mimetype,
            path: req.file && req.file.path,
        });
        if (req.isAPICall) {
            res.json(release.toJSON());
        }
        else {
            req.flash("success", { msg: `Success! Created Release ${req.body.name}` });
            res.redirect(`/cms/projects/${req.params.id}`);
        }
    })
]);
exports.postEditRelease = connect_compose_1.default([
    upload.single("file"),
    asyncHandler_1.asyncHandler(async (req, res) => {
        req.assert("name", "Name is required").notEmpty();
        req.assert("track", "Track is required").notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            if (req.isAPICall) {
                throw new errors_1.BadRequestError(errors[0].msg);
            }
            else {
                req.flash("errors", errors);
                return res.redirect(`/cms/projects/${req.params.id}/releases/edit`);
            }
        }
        const updates = {
            name: req.body.name,
            note: req.body.note,
            track: req.body.track,
        };
        if (req.file) {
            updates.fileName = req.file.originalname;
            updates.mimetype = req.file.mimetype;
            updates.path = req.file.path;
        }
        const release = await Release_1.default.findByIdAndUpdate(req.params.releaseId, updates);
        if (req.isAPICall) {
            res.json(release.toJSON());
        }
        else {
            res.redirect(`/cms/projects/${req.params.id}`);
        }
    })
]);
exports.deleteRelease = asyncHandler_1.asyncHandler(async (req, res) => {
    await Release_1.default.deleteOne({
        _id: req.params.releaseId
    });
    res.redirect(`/cms/projects/${req.params.id}`);
});
exports.downloadRelease = asyncHandler_1.asyncHandler(async (req, res) => {
    const release = await Release_1.default.findById(req.params.releaseId);
    res.setHeader("Content-disposition", `attachment; filename=${release.fileName}`);
    res.setHeader("Content-type", release.mimetype);
    const stream = fs_extra_1.default.createReadStream(release.path);
    stream.on("error", (err) => next(err));
    stream.pipe(res);
});
exports.getProjectImage = asyncHandler_1.asyncHandler(async (req, res, next) => {
    const imagePath = path_1.default.join(directory_1.STORAGE_DIRECTORY, `upload/${req.params.id}/icon`);
    const stream = fs_extra_1.default.createReadStream(imagePath);
    stream.on("error", (err) => next(err));
    stream.pipe(res);
});
//# sourceMappingURL=project.js.map