import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../util/asyncHandler";
import APIKey from "../models/APIKey";
import { UnauthorizedError } from "../util/errors";

export let isAuthorized = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers.authorization;
  if (!key) {
    throw new UnauthorizedError("Unauthorized");
  }
  const apiKey = await APIKey.findOne({
    key,
  });
  if (!apiKey) {
    throw new UnauthorizedError("Unauthorized");
  }
  req.apiKey = apiKey;
  next();
});

export let isAuthorizedForProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.apiKey.projectId !== req.params.id && req.apiKey.projectId !== "*") {
    throw new UnauthorizedError("Unauthorized for this project");
  }
  next();
});
