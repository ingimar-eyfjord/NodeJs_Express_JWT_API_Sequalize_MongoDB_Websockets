module.exports = (app, VerifyToken) => {
  const db = require("../models/index.js");
  const Roles = db.ROLES;
  const hours = require("../controllers/hours.controller.js");
  var router = require("express").Router();
  const procedure = require("../controllers/procedures.controller.js");
  // Retrieve all hours
  router.get("/Hours", VerifyToken(), hours.findAll);

  // Retrieve a single Tutorial with id
  router.get("/Hours/:id", VerifyToken(), hours.findOne);

  // Update a Tutorial with id
  router.put("/Hours/:id", VerifyToken(Roles[1]), hours.update);

  // Delete a Tutorial with id
  router.delete("/Hours/:id", VerifyToken(Roles[1]), hours.delete);

  router.delete("/Hours/delete/bulk", VerifyToken(Roles[1]), hours.Bulkdelete);
  
  // Create a new Tutorial
  router.post("/Hours", VerifyToken(), hours.create);

  // Retrieve all single instances of matching day
  router.get("/Hours/start/:start/end/:end", VerifyToken(), hours.findAllInDay);
  
  router.get(`/Hours/project/:project/start/:start/end/:end/sum/hours`, VerifyToken(), hours.sum_by_Month_and_project);

  //! Look at this here Adriano...
  // Retrieve all for start and endDates for one person
  router.get("/Hours/user/:UserUUID/start/:start/end/:end", VerifyToken(), hours.findUserBetween);
  // Retrieve hours for one person
  router.get("/Hours/user/:UserUUID/period/:period", VerifyToken(), hours.findUserByPeriod);
  //? get Hours by task, user id and salary_period
  router.get(`/Hours/user/:UserUUID/start/:start/end/:end/sum/hours`, VerifyToken(), hours.sum_by_Month);
  //? Routes to meetings Treenation
  router.get(`/Hours/user/:UserUUID/start/:start/end/:end/sum/meetings`, VerifyToken(), hours.sum_meetings_by_Month_User);
  // Retrieve all published hours
  router.get(`/Hours/user/:UserUUID/start/:start/end/:end/avg/contacts`, VerifyToken(), hours.average_contacts_Month);
  // router.get("/Procedure/period/day/:params", VerifyToken(), procedure.GetPeriodByDay);

  app.use("/api", router);
};


