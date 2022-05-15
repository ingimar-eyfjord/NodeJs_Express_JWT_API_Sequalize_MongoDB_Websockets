module.exports = (app, VerifyToken) => {
    const logs = require("../controllers/Logs.controller.js");
    var router = require("express").Router();
    router.get("/Logs", VerifyToken(), logs.find_logs);

    //? Below is api routes for deferred hourss
    router.get("/Logs/user/:UserUUID/limit/:limit", VerifyToken(), logs.find_logs_for_user_limit);

    app.use("/api", router);
  };
  