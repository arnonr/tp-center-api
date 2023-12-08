const express = require("express");
// import api from './api/index.js' 
const campus = require("./api/campus");
const user = require("./api/user");
const center = require("./api/center");
const administrator = require("./api/administrator");
const projectType = require("./api/project-type");
const project = require("./api/project");
const inspection = require("./api/inspection");
const group = require("./api/group");
const router = express.Router();

router.use(
  `${process.env.SUB_URL}/api/v${process.env.API_VERSION}`,
  router.use("/campus", campus),
  router.use("/center", center),
  router.use("/administrator", administrator),
  router.use("/user", user),
  router.use("/project-type", projectType),
  router.use("/project", project),
  router.use("/inspection", inspection),
  router.use("/group", group),
);

module.exports = router;
