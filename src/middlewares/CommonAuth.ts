import { Request, Response, NextFunction } from "express";
import { AuthPayload } from "../dto/Auth.dto";
import { ValidateSignature } from "../utility";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const Authenticate = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const validate = await ValidateSignature(req);
  if (validate) {
    next();
  } else {
    return resp.json({ message: "User not authorized" });
  }
};
