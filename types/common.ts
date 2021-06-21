import { Request, Response, NextFunction } from 'express';

export type ControllerArgs = [_req: Request, res: Response, _next: NextFunction];

export type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        email: string;
        phoneNo: string;
        userName: string;
        accountStatus: string;
        accountType: string;
        userType: string;
        isVerified: boolean;
    };
};

export type AuthenticatedControllerArgs = [
    _req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
];

export type SuggestionResultOption<T> = {
    text: string;
    _index: string;
    _type: string;
    _id: string;
    _score: number;
    _source: T;
};

export type SuggestionResult<T> = {
    text: string;
    offset: number;
    length: number;
    options: Array<SuggestionResultOption<T>>;
};
