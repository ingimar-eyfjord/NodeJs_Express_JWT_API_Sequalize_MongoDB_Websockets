module.exports = (app, VerifyToken) => {
  const reports = require("../controllers/reports.controller.js");

  var router = require("express").Router();
  // Create a new Tutorial
  router.post("/Reports", VerifyToken, reports.create);
  // Retrieve all reports
  router.get("/Reports", VerifyToken, reports.findAll);
  // Retrieve a single Tutorial with id
  router.get("/Reports/:id", VerifyToken, reports.findOne);
  // Update a Tutorial with id
  router.put("/Reports/:id", VerifyToken, reports.update);
  // Delete a Tutorial with id
  router.delete("/Reports/:id", VerifyToken, reports.delete);
  // Retrieve all single instances of matching day
  router.get("/Reports/day/:day", VerifyToken, reports.findAllInDay);
  app.use("/api", router);
};
