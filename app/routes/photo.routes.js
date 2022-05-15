module.exports = (app, VerifyToken) => {
    const photo = require("../controllers/photo.controller.js");
    var router = require("express").Router();

    router.post("/Photo", VerifyToken(), photo.CreateProfilePhoto);

    router.get("/Photo/user/:UserUUID", VerifyToken(), photo.GetProfilePhoto);
    
    router.put("/Photo/user/:UserUUID", VerifyToken(), photo.UpdateToLatestPhoto);
    
    app.use("/api", router);
  };