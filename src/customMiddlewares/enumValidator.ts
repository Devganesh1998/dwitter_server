const enumValidator = (
	value: string,
	ENUM: Record<string, unknown>,
	fieldName: string
): boolean => {
	if (value in ENUM) {
		return true;
	}
	throw new Error(
		`Invalid ${fieldName} provided, Available ${fieldName} options - ${Object.keys(ENUM).join(
			', '
		)}`
	);
};

export default enumValidator;
