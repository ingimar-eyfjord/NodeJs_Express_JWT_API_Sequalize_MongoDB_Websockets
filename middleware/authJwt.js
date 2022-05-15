const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const jwt_decode = require("jwt-decode");

const { TokenExpiredError } = jwt;
const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }
  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

export const VerifyToken = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return [
    (req, res, next) => {
      let token = req.headers["x-access-token"];
      if (!token) {
        return res.status(403).send({ message: "No token provided!" });
      }

      jwt.verify(token, config.secret, (err, decoded) => {
        console.log(decoded)
        if (err) {
          return catchError(err, res);
        }
        if (roles.length && !decoded.Role.some(item => roles.includes(item))) {
          // user's role is not authorized
          return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id;
        next();
      });
    }
  ];
};