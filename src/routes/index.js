const express = require("express");
const router = express.Router();
const controller = require("../controller/file.controller");

let routes = (app) => {
  router.post("/upload", controller.upload);
  router.get("/details/:id", controller.getDetails);
  router.get("/download/:id", controller.download);

  app.use(router);
};

module.exports = routes;
