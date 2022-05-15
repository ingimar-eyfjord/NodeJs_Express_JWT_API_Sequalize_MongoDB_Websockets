module.exports = (app, VerifyToken) => {
  const db = require("../models/index.js");
  const Roles = db.ROLES;
  const supplements = require("../controllers/supplements.controller.js");

  var router = require("express").Router();
  // Retrieve all supplements
  router.get("/Supplements", VerifyToken(), supplements.GetEverything);
  // Retrieve a single Tutorial with id
  router.get("/Supplements/:id", VerifyToken(), supplements.findOne);
  // Create a new Tutorial
  router.post("/Supplements", VerifyToken(Roles[1]), supplements.create);
  // Update a Tutorial with id
  router.put("/Supplements/:id", VerifyToken(Roles[1]), supplements.update);
  // Delete a Tutorial with id
  router.delete("/Supplements/:id", VerifyToken(Roles[1]), supplements.delete);
  
  app.use("/api", router);
};
