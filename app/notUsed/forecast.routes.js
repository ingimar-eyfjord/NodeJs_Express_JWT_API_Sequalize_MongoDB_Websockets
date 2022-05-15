module.exports = (app, VerifyToken) => {
  const forecast = require("./forecast.controller.js");
  var router = require("express").Router();
  // Create a new forecast
  router.post("/create", VerifyToken, forecast.create);
  // Retrieve all forecast
  router.get("/", VerifyToken, forecast.findAll);
  // Retrieve all forecast for user
  router.get("/userID/:userID", VerifyToken, forecast.GetAllUserID);

  router.get("/userIDMonth/:userID/:month", VerifyToken, forecast.GetAllUserIDAndMonth);
  // Retrieve a single forecast with id
  router.get("/:id", VerifyToken, forecast.findOne);

  router.get("/userIDThreeMonths/:param", VerifyToken, forecast.findOne);

  // Update a forecast with id
  router.put("/:id", VerifyToken, forecast.update);
  // Delete a forecast with id
  router.delete("/:id", VerifyToken, forecast.delete);
  app.use("/api/forecast", router);
};
