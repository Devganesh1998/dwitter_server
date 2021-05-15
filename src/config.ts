import * as types from './types';

export const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development';
export const isProd = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production';
export const PORT = process.env.PORT || 4500;
export const ALLOWED_ORIGINS = [
	process.env.ALLOWED_ORIGIN,
	isDev && 'http://localhost:3000',
].filter((origin) => !!origin);

export const ACCOUNT_TYPE: {
	TRAIL: types.ACCOUNT_TYPE;
	PAID: types.ACCOUNT_TYPE;
	ADMIN: types.ACCOUNT_TYPE;
} = {
	TRAIL: 'TRAIL',
	PAID: 'PAID',
	ADMIN: 'ADMIN',
};

export const ACCOUNT_STATUS: {
	ENABLED: types.ACCOUNT_STATUS;
	DISABLED: types.ACCOUNT_STATUS;
	SUSPENDED: types.ACCOUNT_STATUS;
} = {
	ENABLED: 'ENABLED',
	DISABLED: 'DISABLED',
	SUSPENDED: 'SUSPENDED',
};

export const USER_TYPE: {
	INTERNAL: types.USER_TYPE;
	EXTERNAL: types.USER_TYPE;
} = {
	INTERNAL: 'INTERNAL',
	EXTERNAL: 'EXTERNAL',
};
