module.exports = (app, VerifyToken) => {
  const db = require("../models/index.js");
  const Roles = db.ROLES;
  const procedure = require("../controllers/procedures.controller.js");

  const schedule = require("../controllers/schedule.controller.js");
  var router = require("express").Router();
  // Retrieve all schedule
  router.get("/Schedule", VerifyToken(), schedule.findAll);
  // Create a new Tutorial
  router.post("/Schedule", VerifyToken(), schedule.create);
  // Update a Tutorial with id
  router.put("/Schedule/:id", VerifyToken(), schedule.update);
  // Delete a Tutorial with id
  router.delete("/Schedule/:id", VerifyToken(), schedule.delete);
  router.post("/Schedule/import", VerifyToken(Roles[1]), schedule.Import);
  // Retrieve a single Tutorial with id
  router.get("/Schedule/:id", VerifyToken(), schedule.findOne);


  // router.get("/Procedure/GetMonthlyHours/:params", VerifyToken(), procedure.GetMonthlyHours);
  router.get("/Schedule/month/:date/sum/hours", VerifyToken(), procedure.GetMonthlyHours);
  // Import from XLSX front end
  router.get("/Schedule/start/:start/end/:end", VerifyToken(), schedule.findAllInDay);


  // Get all records with table bookings for between two dates
  router.get("/Schedule/start/:start/end/:end/tables", VerifyToken(), schedule.GetBooked);
  // Get input where day and where user (UserUUID)
  router.get("/Schedule/user/:UserUUID/start/:start/end/:end", VerifyToken(), schedule.DayAndUser);
  // Get true or false if one exists with Date and UserUUID
  router.get("/Schedule/user/:UserUUID/start/:date/end/:date/ping", VerifyToken(), schedule.pingTrueFalse);

  // Get Paginated Day on Schedule from user and order by date from today.
  router.get("/Schedule/user/:UserUUID/start/:date/limit/:limit/offset/:offset", VerifyToken(), schedule.pageDaysFromToday);

  // router.get("/Procedure/GetMonthlyHoursByUserArray/:params", VerifyToken(), procedure.GetMonthlyHoursByUserArray);
  router.get("/Schedule/users/:[usernames]/month/:date/sum/hours", VerifyToken(), procedure.GetMonthlyHoursByUserArray);






  // router.get("/Procedure/ExportScheduleMonthlyByTeam/:params", VerifyToken(), procedure.ExportScheduleMonthlyByTeam);
  router.get("/Schedule/team/:id/month/:date", VerifyToken(), procedure.ExportScheduleMonthlyByTeam);
  // router.get("/Procedure/GetHoursForTheMonth/:params", VerifyToken(), procedure.GetHoursForTheMonth);
  router.get("/Schedule/team/:id/month/:date/sum/hours", VerifyToken(), procedure.GetHoursForTheMonth);


  app.use("/api", router);
};
