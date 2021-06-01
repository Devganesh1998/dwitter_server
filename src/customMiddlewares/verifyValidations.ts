import { NextFunction, Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';

const verifyValidations = (req: Request, res: Response, next: NextFunction): void => {
	const errors = validationResult(req);
	const validFields = matchedData(req);
	const validationFailedFields = Object.keys(errors.mapped()).map((key) => {
		if (key === '_error') {
			const mappedErrors: any = errors.mapped();
			return mappedErrors[key].nestedErrors
				.map(({ param }: { param: string }) => param)
				.join('|');
		}
		return key;
	});

	if (!errors.isEmpty()) {
		res.status(400).json({
			errors: errors.mapped(),
			error_msg: 'Please send the required fields',
			'Required fields': [...Object.keys(validFields), ...validationFailedFields],
		});
		return;
	}

	next();
};

export default verifyValidations;
