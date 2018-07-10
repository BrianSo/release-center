import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../util/asyncHandler";
import APIKey from "../models/APIKey";
import {UnauthorizedError} from "../util/errors";

export let isAuthorized = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers.authorization;
  if (!key) {
    throw new UnauthorizedError("Unauthorized");
  }
  const found = await APIKey.findOne({
    key,
  });
  if (!found) {
    throw new UnauthorizedError("Unauthorized");
  }
  next();
});
