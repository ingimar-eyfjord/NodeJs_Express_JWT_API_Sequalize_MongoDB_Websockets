
module.exports = (app, VerifyToken) => {
  const cors = require("cors");
  const Emply = require("../controllers/Emply.controller.js");

  var router = require("express").Router();
  router.get("/Emply/depertments", VerifyToken(), Emply.RetrieveDepartments);
  router.get("/Emply/employee/:email", VerifyToken(), Emply.GetUserByEmail);
  router.get("/Emply/employee/:EmplyUUID/contactData", VerifyToken(), Emply.GetContactDataID);
  router.get("/Emply/employee/:EmplyUUID/masterData", VerifyToken(), Emply.GetMasterDataID);
  router.put("/Emply/employee/:EmplyUUID/masterData", VerifyToken(), Emply.UpdateEmployeeData)
  router.get("/Emply/employees", VerifyToken(), Emply.GetAllEmployees)
  router.get("/Emply/user/UserUUID/:UserUUID", VerifyToken(), Emply.GetUUID);
  router.get("/Emply/users", VerifyToken(), Emply.GetAllUsers);

  var corsOptions = {
    // origin will allow specific domains to access the server.
    origin: "*",
  };
  app.use(cors(corsOptions));
  app.use("/api", router);
};
