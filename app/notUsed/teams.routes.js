module.exports = (app, VerifyToken) => {
  const teams = require("./teams.controller.js");

  var router = require("express").Router();
  // Create a new Tutorial
  router.post("/Teams", VerifyToken, teams.create);
  // Retrieve all teams
  router.get("/Teams", VerifyToken, teams.findAll);
  // Update a Tutorial with id
  router.put("/Teams/:id", VerifyToken, teams.update);
  // Delete a Tutorial with id
  router.delete("/Teams/:id", VerifyToken, teams.delete);
  // Retrieve a single Tutorial with id
  router.get("/Teams/:id", VerifyToken, teams.findOne);


  app.use("/api", router);
};
