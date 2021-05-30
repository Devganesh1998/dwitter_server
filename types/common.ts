import { Request, Response, NextFunction } from 'express';

export type ControllerArgs = [_req: Request, res: Response, _next: NextFunction];
