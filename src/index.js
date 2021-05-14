require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
// const db = require("../database/models");
const { isDev, ALLOWED_ORIGINS, PORT, isProd } = require('./config');

const app = express();
app.use(cookieParser());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (isDev) {
  const cors = require("cors");
  app.use(cors());
} else {
  app.use(function (req, res, next) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.indexOf(origin) > -1) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, cookie"
    );
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });
}

app.get("/info", (req, res) => {
  res.send("Welcome to Dwitter server");
});

(async () => {
  let retries = 5;
  while (retries) {
    try {
      // await db.sequelize.sync();
      app.listen(PORT, () => {
        console.log(`listening on: http://localhost:${PORT}`);
      });
      break;
    } catch (err) {
      console.error(err);
      retries -= 1;
      console.log(`Retries left: ${retries}, retrying in 5 seconds.`);
      // wait 5 seconds
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
})();
