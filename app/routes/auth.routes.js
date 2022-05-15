
module.exports = (app, VerifyToken) => {
    const controller = require("../controllers/auth.controller.js");
    const cors = require("cors");
    var router = require("express").Router();
    //   app.use(function(req, res, next) {
    //     res.header(
    //       "Access-Control-Allow-Headers",
    //       "x-access-token, Origin, Content-Type, Accept"
    //     );
    //     next();
    //   });

    //   app.post(
    //     "/auth/signup",
    //     [
    //       verifySignUp.checkDuplicateUsernameOrEmail,
    //       verifySignUp.checkRolesExisted
    //     ],
    //     controller.signup
    //   );
    var corsOptions = {
        // origin will allow specific domains to access the server.
        origin: "*",
    };
    app.use(cors(corsOptions));
    router.post("/auth/signin", controller.signin);
    router.post("/auth/refreshtoken", controller.refreshToken);
    app.use("/api", router);

};
