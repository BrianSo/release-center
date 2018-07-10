import { APIKeyModel } from "../models/APIKey";

declare namespace Express {
  interface Request {
    isAPICall?: boolean;
    apiKey?: APIKeyModel;
  }
}
