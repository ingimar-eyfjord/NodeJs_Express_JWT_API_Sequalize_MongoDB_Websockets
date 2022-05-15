module.exports = (app, VerifyToken) => {

  const db = require("../models/index.js");
  const Roles = db.ROLES;

  const salary = require("../controllers/salary.controller.js");
  var router = require("express").Router();

  //? Below is api routes for salary periods
  router.get("/Salary/period/between/:date/user/:UserUUID/sum/hours", VerifyToken(), salary.GetPeriodByDay);
  // Retrieve current period 
  router.get("/Salary/period/current", VerifyToken(), salary.find_current_period);

  // Retrieve the salary period for the month
  router.get("/Salary/period/month/:date", VerifyToken(), salary.find_period_by_month);


  router.get("/Salary/period/date/:date", VerifyToken(), salary.find_period_by_date);


  // Retrieve all single instances of periods of the year
  router.get("/Salary/periods/year/:date", VerifyToken(), salary.find_periods_in_year);

  // Retrieve all single instances of periods of the year
  router.get("/Salary/periods/year/:date/name", VerifyToken(), salary.find_periods_in_year_name);


  // Retrieve all single instances of periods of the year
  router.get("/Salary/export/period/:id", VerifyToken(), salary.export_salary);
  // Create a new Salary
  router.post("/Salary/period", VerifyToken(Roles[1]), salary.create_period);

  // Retrueve the current salary period
  // Update a Salary period with id
  router.put("/Salary/period/:id", VerifyToken(Roles[1]), salary.update_period);

  // Delete a Salary period with id
  router.delete("/Salary/period/:id", VerifyToken(Roles[1]), salary.delete_period);




  //? ----- Salary period routes ends -----


  app.use("/api", router);
};
