const config = require("../../config/auth.config");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("refreshToken", {
    token: {
      type: Sequelize.STRING,
    },
    expiryDate: {
      type: Sequelize.DATE,
    },
    Account: {
      type: Sequelize.STRING(255),
      allowNull: false,
      noUpdate: true
  },
  });
  RefreshToken.createToken = async function (user) {
    let expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
    let _token = uuidv4();
    let refreshToken = await this.create({
      token: _token,
      Account: user.id,
      expiryDate: expiredAt.getTime(),
    });

    return refreshToken.token;
  };
  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };
  
  RefreshToken.getUser = async function (userID) {
    let refreshToken = await this.findOne({ where: { Account: userID } });
    return refreshToken.Account;
  };
  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };

  return RefreshToken;
};