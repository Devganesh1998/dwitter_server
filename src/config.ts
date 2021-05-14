export const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development';
export const isProd = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production';
export const PORT = process.env.PORT || 4500;
export const ALLOWED_ORIGINS = [process.env.ALLOWED_ORIGIN, isDev && 'http://localhost:3000'].filter(origin => !!origin);
