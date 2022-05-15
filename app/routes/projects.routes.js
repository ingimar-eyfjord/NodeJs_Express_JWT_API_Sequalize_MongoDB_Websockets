module.exports = (app, VerifyToken) => {
  const db = require("../models/index.js");
  const Roles = db.ROLES;
  const projects = require("../controllers/projects.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/Project", VerifyToken(Roles[1]), projects.create);

  // Retrieve all projects
  router.get("/Project", VerifyToken(), projects.findAll);

  // Retrieve a single Tutorial with id
  router.get("/Project/:id", VerifyToken(), projects.findOne);

  // Update a single Tutorial with id
  router.put("/Project/:id", VerifyToken(Roles[1]), projects.update);

  // Delete a single Tutorial with id
  router.delete("/Project/:id", VerifyToken(Roles[1]), projects.delete);

  // Retrieve all single instances of matching day
  router.get("/Project/team/:id", VerifyToken(), projects.GetAllInTeam);



  app.use("/api", router);
};
