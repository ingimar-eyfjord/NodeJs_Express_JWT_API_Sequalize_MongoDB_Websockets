const db = require("../models/index.js");
const config = require("../../config/auth.config");

const Roles = db.ROLES;
// const User = db.user;
// const Role = db.role;
const jwt_decode = require("jwt-decode");
const Op = db.Sequelize.Op;
const axios = require("axios");
const fetch = require("node-fetch");
require("dotenv").config();
const { refreshToken: RefreshToken } = db;

require("dotenv").config();

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
let handleQueryError = function (err) {
  return new Response(
    JSON.stringify({
      code: 400,
      message: "Network Error",
    })
  );
};
// exports.signup = (req, res) => {
//   // Save User to Database
//   User.create({
//     username: req.body.username,
//     email: req.body.email,
//     password: bcrypt.hashSync(req.body.password, 8)
//   })
//     .then(user => {
//       if (req.body.roles) {
//         Role.findAll({
//           where: {
//             name: {
//               [Op.or]: req.body.roles
//             }
//           }
//         }).then(roles => {
//           user.setRoles(roles).then(() => {
//             res.send({ message: "User registered successfully!" });
//           });
//         });
//       } else {
//         // user role = 1
//         user.setRoles([1]).then(() => {
//           res.send({ message: "User registered successfully!" });
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({ message: err.message });
//     });
// };

async function GetAzureData(bearer) {
  let decoded = jwt_decode(bearer); //Get the tenant ID from the decoded token

  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${bearer}`,
      ConsistencyLevel: "eventual",
    },
  };
  let AzureData;
  const url5 = `https://graph.microsoft.com/v1.0/users/${decoded.oid}`;
  let response = await fetch(url5, accessTokenReqOptions);

  const url6 = `https://graph.microsoft.com/v1.0/groups/b5e910d0-4370-47a1-b834-c463618965a8/members`;
  let Role = await fetch(url6, accessTokenReqOptions);

  try {
    AzureData = await response.json();
    Role = await Role.json();
  } catch (error) {
    AzureData = error;
  }
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
    return;
  }

  var result = Role.value.filter((x) => x.id === AzureData.id);
  if (result.length > 0) {
    Role = Roles;
  } else {
    Role = Roles[0];
  }
  // Role = Roles[0]
  return [await AzureData, await Role];
}

exports.signin = async (req, res) => {
  // #swagger.tags = ["Authorize"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const data = await GetAzureData(req.body.token);

  let [AzureData, Roles] = data;

  const token = jwt.sign({ id: AzureData.id, Role: Roles }, config.secret, {
    expiresIn: config.jwtExpiration,
  });

  let refreshToken = await RefreshToken.createToken(AzureData);

  res.status(200).send({
    id: AzureData.id,
    username: AzureData.displayName,
    email: AzureData.mail,
    accessToken: token,
    Bearer: req.body.token,
    refreshToken: refreshToken,
    Role: Roles,
  });

  //   User.findOne({
  //     where: {
  //       username: req.body.username
  //     }
  //   })
  //     .then(user => {
  //       if (!user) {
  //         return res.status(404).send({ message: "User Not found." });
  //       }

  //     //   var passwordIsValid = bcrypt.compareSync(
  //     //     req.body.password,
  //     //     user.password
  //     //   );

  //       if (!passwordIsValid) {
  //         return res.status(401).send({
  //           accessToken: null,
  //           message: "Invalid Password!"
  //         });
  //       }

  //       var token = jwt.sign({ id: user.id }, process.env.API_secret, {
  //         expiresIn: 86400 // 24 hours
  //       });

  //       var authorities = [];
  //       user.getRoles().then(roles => {
  //         for (let i = 0; i < roles.length; i++) {
  //           authorities.push("ROLE_" + roles[i].name.toUpperCase());
  //         }
  //         res.status(200).send({
  //           id: user.id,
  //           username: user.username,
  //           email: user.email,
  //           roles: authorities,
  //           accessToken: token
  //         });
  //       });
  //     })
  //     .catch(err => {
  //       res.status(500).send({ message: err.message });
  //     });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }
  try {
    let refreshToken = await RefreshToken.findOne({
      where: { token: requestToken },
    });
    if (!refreshToken) {
      console.log("Refresh token is not in database!");

      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }
    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });
      console.log(
        "Refresh token was expired. Please make a new signin request"
      );

      res.status(403).send({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }
    const data = await GetAzureData(req.body.token);

    let [AzureData, Roles] = data;
    const newAccessToken = jwt.sign(
      { id: AzureData.id, Role: Roles },
      config.secret,
      {
        expiresIn: config.jwtExpiration,
      }
    );
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
