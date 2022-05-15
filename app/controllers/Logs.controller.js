const db = require("../models/index.js");
const Logs = db.Master_log;
const Op = db.Sequelize.Op;

function isValidJSONString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}


exports.find_logs = (req, res) => {
  let query = {order: [['id', 'DESC']],}
if(req.query.limit){
  query.limit = req.query.limit ? parseInt(req.query.limit) : 5
}
if(req.query.offset){
  query.offset = req.query.offset ? parseInt(req.query.offset) : 0
}
  Logs.findAll(query).then((data) => {
    res.send(data)
  })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving logs with id=",
      });
    });

}
//! Look at this here Adriano...
exports.find_logs_for_user_limit = (req, res) => {
    // #swagger.tags = ['Hours']
    // #swagger.description = 'Retrieves hour records for users in between two dates'
  
    // was:  router.get("/Hours/dayAndUser/:param", VerifyToken, hours.findUserBetween);
    // is:   router.get("/Hours/User/:UserUUID/start/:start/end/:end", VerifyToken, hours.findUserBetween);
    // const params = JSON.parse(req.params.param);
  const limit = req.params.limit
    Logs.findAll({
          where: {
            Account: req.params.UserUUID,
          },
          order: [['id', 'DESC']],
          limit: limit ? parseInt(limit) : 5
    }).then((data) => {
      res.send(data)
    })
      .catch((err) => {
        console.log(err)
        res.status(500).send({
          message: "Error retrieving Hours with id=",
        });
      });
  
  
    /*
  
    Transaction_ID.findAll({
    include: [
      {
        model: Ledger,
        where: {
          Account: req.params.UserUUID,
        },
        //attributes: []
      },
      {
        model: Hours,
        where: {
          Date: {
            [Op.between]: [req.params.start, req.params.end],
          }
        },
        //attributes: []
      },
    ],
    
    
  }).then((data) => {
  
    console.log(data)
  
    res.send(data)
  })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Hours with id=",
      });
    });
    */
  };
  