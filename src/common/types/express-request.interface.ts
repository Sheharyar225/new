// src/common/types/express-request.interface.ts
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}
