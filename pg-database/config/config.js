module.exports = {
  development: {
    url: process.env.DEV_DATABASE_URL,
    dialect: "postgres",
  },
  production: {
    url: process.env.PROD_DATABASE_URL,
    dialect: "postgres",
  },
};
