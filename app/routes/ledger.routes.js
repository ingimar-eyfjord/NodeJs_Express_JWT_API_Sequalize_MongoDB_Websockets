module.exports = (app, VerifyToken) => {
    const ledger = require("../controllers/ledger.controller.js");
    var router = require("express").Router();

    //? Below is api routes for deferred hourss
    
    // Retrieve all ledger items for user
    router.get("/Ledger/user/:UserUUID/period/:id", VerifyToken(), ledger.find_transactions_by_user);

    // Retrieve net hours by salary period 
    router.get("/Ledger/user/:UserUUID/period/:id/net", VerifyToken(), ledger.find_net_in_salary_period);

    // Retrieve debit by salary period (depends on the param debit and credit)
    router.get("/Ledger/user/:UserUUID/period/:id/debit", VerifyToken(), ledger.find_debit_hours);

    // Retrieve credit hours by salary period (depends on the param debit and credit)
    router.get("/Ledger/user/:UserUUID/period/:id/credit", VerifyToken(), ledger.find_credit_hours);
    
    // Create a new Deferred hours for user
    router.post("/Ledger", VerifyToken(), ledger.create_deferred);

    app.use("/api", router);
  };
  