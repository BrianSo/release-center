import { Request, Response, NextFunction } from "express";
import errorHandler from "errorhandler";
const devErrorHandler = errorHandler();
export default (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    res.status(500);
    res.send("Internal Server Error");
    return;
  }
  res.status(err.status || 500);
  if (req.isAPICall) {
    const error = {
      message: err.message,
      status: err.status
    };

    if (process.env.NODE_ENV !== "production") {
      error.stack = err.stack;
    }

    res.json({
      error
    });
  } else {
    if (process.env.NODE_ENV === "production") {
      res.send(err.message);
    } else {
      devErrorHandler(err, req, res, next);
    }
  }
};
