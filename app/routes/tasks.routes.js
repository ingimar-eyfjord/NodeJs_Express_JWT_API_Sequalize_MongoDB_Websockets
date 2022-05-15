module.exports = (app, VerifyToken) => {
  const db = require("../models/index.js");
  const Roles = db.ROLES;
  const tasks = require("../controllers/tasks.controller.js");
  var router = require("express").Router();

  // Retrieve all tasks
  router.get("/Task", VerifyToken(), tasks.findAll);
  // Retrieve a single Tutorial with id
  router.get("/Task/:id", VerifyToken(), tasks.findOne);
  // Retrieve all single instances of Tasks in team
  router.get("/Task/team/:team", VerifyToken(), tasks.GetAllInTeam);
  // Create a new Tutorial
  router.post("/Task", VerifyToken(Roles[1]), tasks.create);
  // Update a Tutorial with id
  router.put("/Task/:id", VerifyToken(Roles[1]), tasks.update);
  // Update a Tutorial with id
  router.put("/Task/bulk/:id", VerifyToken(Roles[1]), tasks.BulkUpdate);
  // Delete a Tutorial with id
  router.delete("/Task/:id", VerifyToken(Roles[1]), tasks.delete);
  app.use("/api", router);
};
