// const express = require("express");
import express from "express";
import jwt from "jsonwebtoken";
import websockets from "./websockets/index";
import startup from "./lib/startup";
import logger from "./lib/logger";
import middleware from "./middleware/index";
import mongoose from "mongoose";
import swaggerUi from 'swagger-ui-express'
import swaggerFile from './swagger_output.json'
// import rateLimit from 'express-rate-limit'
import {VerifyToken} from "./middleware/authJwt.js"
require("dotenv").config();

startup()
  .then(() => {
    const app = express();
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
    // app.use(
    //   rateLimit({
    //     windowMs: 12 * 60 * 60 * 1000, // 12 hour duration in milliseconds
    //     max: 5,
    //     message: "You exceeded 100 requests in 12 hour limit!",
    //     headers: true,
    //   })
    // );
    
    middleware(app);
    
    // async function VerifyToken(req, res, next) {
    //   var token = req.headers["x-access-token"];
    //   if (!token) return res.status(403).send({ auth: false, message: "No token provided." });
    //   jwt.verify(token, process.env.API_secret, function (err, decoded) {
    //     if (err) return res.status(500).send({ auth: false, message: "Failed to authenticate token." });
    //   next();
    //   });
    // }
    require("./app/routes/auth.routes.js")(app);
    require("./app/routes/schedule.routes")(app, VerifyToken);
    require("./app/routes/hours.routes")(app, VerifyToken);
    require("./app/routes/tasks.routes")(app, VerifyToken);
    require("./app/routes/supplements.routes")(app, VerifyToken);
    require("./app/routes/projects.routes")(app, VerifyToken);
    require("./app/routes/locations.routes")(app, VerifyToken);
    require("./app/routes/Emply.routes.js")(app, VerifyToken);
    require("./app/routes/salary.routes.js")(app, VerifyToken);
    require("./app/routes/ledger.routes.js")(app, VerifyToken);
    require("./app/routes/photo.routes.js")(app, VerifyToken);
    require("./app/routes/logs.routes.js")(app, VerifyToken);
   



    // set port, listen for requests
    const PORT = process.env.PORT || 8082;
    const server = app.listen(PORT, () => {
      if (process.send) {
        console.log(`Server running at http://localhost:${PORT}\n\n`)
        process.send(`Server running at http://localhost:${PORT}\n\n`);
      }
    });



    mongoose
      .connect(
        'mongodb://localhost:27017/websockets',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => websockets(server))
      .catch((err) => console.log(err));

    process.on("message", (message) => {
      console.log(message);
    });

  })
  .catch((error) => {
    logger.error(error);
  });
