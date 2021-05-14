
const isDev = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development';
const isProd = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production';

exports.PORT = process.env.PORT || 4500;
exports.isDev = isDev;
exports.isProd = isProd;
exports.ALLOWED_ORIGINS = [process.env.ALLOWED_ORIGIN, isDev && 'http://localhost:3000'];
