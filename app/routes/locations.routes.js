module.exports = (app, VerifyToken) => {
  const db = require("../models/index.js");
  const Roles = db.ROLES;
  const locations = require("../controllers/locations.controller.js");

  var router = require("express").Router();

  // Create a new Locations
  router.post("/Locations", VerifyToken(Roles[1]), locations.create);

  // Retrieve all Locations
  router.get("/Locations", VerifyToken(), locations.findAll);

  // Retrieve a single Locations with id
  router.get("/Locations/:id", VerifyToken(), locations.findOne);

  // Update a Locations with id
  router.put("/Locations/:id", VerifyToken(Roles[1]), locations.update);

  // Delete a Locations with id
  router.delete("/Locations/:id", VerifyToken(Roles[1]), locations.delete);

  app.use("/api", router);
};
