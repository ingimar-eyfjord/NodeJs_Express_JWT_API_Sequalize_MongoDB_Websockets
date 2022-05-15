
const { isNull } = require("lodash");
const { sequelize, Transaction_ID } = require("../models/index.js");
const db = require("../models/index.js");
const ledger = db.ledger;
const Hours = db.hours;
const salary_period = db.salary_period;
const transaction_id = db.Transaction_ID;
const Op = db.Sequelize.Op;

// Create and Save a new Reports
exports.create_deferred = async (req, res) => {
    // #swagger.tags = ["Ledger"]
    // #swagger.description = 'Creates a double transactional ledger records for one user. A debit record for the salary-period the user wishes to deffer hours from and a credit record for the salary-period the user wishes to defer hours to.'

    // Validate reques

    if (!req.body.debit_month_name) {
        res.status(500).send({
            message: "Content can not be empty!",
        });
        return;
    }

    if (!req.body.credit_month_name) {
        res.status(500).send({
            message: "Content can not be empty!",
        });
        return;
    }

    if (!req.body.Hours) {
        res.status(500).send({
            message: "Content can not be empty!",
        });
        return;
    }
    if (!req.body.Hours > 50) {
        res.status(500).send({
            message: "A max of 50 hours can be defered per salary period!",
        });
        return;
    }

    if (!req.body.Supplement) {
        res.status(500).send({
            message: "Content can not be empty!",
        });
        return;
    }
    if (req.body.debit_month_name === req.body.credit_month_name) {
        res.status(500).send({
            message: "Cannot be same months!",
        });
        return;
    }

    const type_transaction = req.body.Supplement;
    const user_uuid = req.body.User_UUID;
    const hours = req.body.Hours;
    const date = new Date()

    const current_period = await salary_period.findAll({
        where: {
            [Op.and]: {
                "Date_start": {
                    [Op.lte]: date,
                },
                "Date_end": {
                    [Op.gte]: date
                }
            }
        }
    }).then((data) => {
        return data[0]?.dataValues
    })
        .catch((err) => {
            console.log(err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Salary Periods.",
            });
        });

    const debit_period = await salary_period.findAll({ where: { Month_name: req.body.debit_month_name } })
        .then((data) => {
            return data[0]?.dataValues
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Salary Periods.",
            });
        });

    const credit_period = await salary_period.findAll({ where: { Month_name: req.body.credit_month_name } })
        .then((data) => {
            return data[0]?.dataValues
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Salary Periods.",
            });
        });


    // Filter where you can't transfer hours from year-to-year

    if (debit_period.Date_end.getYear() !== credit_period.Date_end.getYear()) {
        return res.status(403).send({
            message: "Different years, must be same year!",
        });
    }


    if (credit_period.Date_start <= current_period.Date_end) {
        return res.status(403).send({
            message: "It's not allowed to defer backwards!",
        });
    }

    // GET HOURS

    let balance = await ledger.findAll({
        where: {
            Salary_period: {
                [Op.eq]: debit_period.id,
            },
            Account: {
                [Op.eq]: user_uuid,
            },
            Type: {
                [Op.eq]: type_transaction
            }
        },
        attributes: [[sequelize.fn('sum', sequelize.col('Hours')), 'Hours']],
        raw: true
    })

    if (balance[0].Hours < hours) {
        res.status(403).send({
            message: `You do not have enough credit of type ${type_transaction} this salary period!`,
        });
        return
    }




    const credit = await ledger.findAll({
        where: {
            Account: user_uuid,
            Salary_period: {
                [Op.eq]: debit_period.id,
            },
            Credit: {
                [Op.eq]: true,
            }
        },
        attributes: [[sequelize.fn('sum', sequelize.col('Hours')), 'Hours']],
        raw: true,
    })

    if (credit[0].Hours >= 50) {
        res.status(403).send({
            message: `A maximum of 50 hours can be deffered of type ${type_transaction} has been reached this salary period!`,
        });
        return
    }

    const t = await db.sequelize.transaction()

    try {
        const id = await transaction_id.create("", { transaction: t });

        const Debit_Row = {
            Account: user_uuid,
            Salary_period: debit_period.id,
            Hours: -(hours),
            Debit: true,
            Credit: false,
            Transaction_ID: id.Transaction_ID,
            Type: type_transaction,
            Status: "Unpaid"
        };

        //console.log(Debit_Row)

        const Credit_Row = {
            Account: user_uuid,
            Salary_period: credit_period.id,
            Hours: hours,
            Debit: false,
            Credit: true,
            Transaction_ID: id.Transaction_ID,
            Type: type_transaction,
            Status: "Unpaid"
        };

        //console.log(Credit_Row)


        await ledger.create(Debit_Row, { transaction: t });

        await ledger.create(Credit_Row, { transaction: t });

        await t.commit();

        res.status(200).send({
            message: "Transaction success!",
        });



    } catch (err) {

        await t.rollback();

        return res.status(500).send({
            message:
                err.message || "Some error occurred while creating the ledger hours transaction.",
        });

    }




    //?  END FUNCTIONS

};



// Retrieve all hours of user from the database.
exports.find_transactions_by_user = (req, res) => {
    // #swagger.tags = ["Ledger"]ZZ
    // #swagger.description = 'Retrieve all ledger items for user'

    function isValidJSONString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    let query = {
        where:
        {
            Account: { [Op.eq]: req.params.UserUUID },
            Salary_period: { [Op.eq]: req.params.id },
        }
    }
    let filter = '';

    if (isValidJSONString(req.query.filter)) {
        //cool we are valid, lets parse
        filter = JSON.parse(req.query.filter);
        query.where.Type = {
            [Op.eq]: filter,
        }
    }
    ledger.findAll(
        query
    )
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Hours Transactions.",
            });
        });
};

// Retrieve hours by salary period

exports.find_debit_hours = (req, res) => {
    // #swagger.tags = ["Ledger"]
    // #swagger.description = 'Endpoint para obter um usuário.'

    //making this now debit hours api

    const user_uuid = req.params.UserUUID;
    const period_id = req.params.id;
    const debit = true
    const credit = false

    function isValidJSONString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    let query = {
        model: ledger,
        where: {
            Account: user_uuid,
            Salary_period: {
                [Op.eq]: period_id,
            },
            Debit: {
                [Op.eq]: debit,
            },
            Credit: {
                [Op.eq]: credit,
            },

        },
        attributes: []
    }
    let filter = '';

    if (isValidJSONString(req.query.filter)) {
        //cool we are valid, lets parse
        filter = JSON.parse(req.query.filter);
        query.where.Type = {
            [Op.eq]: filter,
        }
    }



    Transaction_ID.findAll({
        include: [
            query
        ],
        group: [
            "Transaction_ID.Transaction_ID", "Ledgers.id", "Ledgers.Account"
        ],
        attributes: ["Ledgers.Account", [sequelize.fn('sum', sequelize.col('Hours')), 'Hours']],
        raw: true,
        group: [
            "Ledgers.Account",
        ],
    }).then((data) => {

        res.send(data)
    })
        .catch((err) => {
            res.status(500).send({
                message: "Error retrieving Hours with id=",
            });
        });

    //

    /*

    ledger.findAll({

        where: {
            Salary_period: {
                [Op.eq]: period_id,
            },
            Account: {
                [Op.eq]: user_uuid,
            },
            Debit: {
                [Op.eq]: debit,
            },
            Credit: {
                [Op.eq]: credit,
            },
        },
        attributes: [[sequelize.fn('sum', sequelize.col('Hours')), 'Hours']],
    }).then((data) => {
        res.send(data);
    })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Defferred hours this month.",
            });
        });
    */


};



const find_credit_hours = (req, res) => {
    // #swagger.tags = ["Ledger"]
    // #swagger.description = 'Endpoint para obter um usuário.'
    //making this now debit hours api


    const user_uuid = req.params.UserUUID;
    const period_id = req.params.id;

    const credit = true

    function isValidJSONString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    let query = {
        model: ledger,
        where: {
            Account: user_uuid,
            Salary_period: {
                [Op.eq]: period_id,
            },
            Credit: {
                [Op.eq]: credit,
            }
        },
    }
    let filter = '';
    if (isValidJSONString(req.query.filter)) {
        //cool we are valid, lets parse
        filter = JSON.parse(req.query.filter);
        query.where.Type = {
            [Op.eq]: filter,
        }
    }

    //const debit = false
    Transaction_ID.findAll({
        include: [
            query,
        ],
        raw: true,
    }).then(async (data) => {
        let array = []
        for (const e of data) {
            array.push({ Transaction_ID: e.Transaction_ID })
        }
        const credit = await ledger.findAll({
            where: {
                [Op.or]: array,
                Salary_period: {
                    [Op.not]: period_id,
                }
            },
            raw: true
        })
        let hours = 0
        for (const e of data) {
            for (const t of credit) {
                if (e.Transaction_ID === t.Transaction_ID) {
                    hours = parseFloat(hours) + parseFloat(e['Ledgers.Hours'])
                }
            }
        }
        res.status(200).send(
            JSON.stringify({
                Hours: hours,
            })
        )
    })
        .catch((err) => {
            res.status(500).send({
                message: "Error retrieving Hours with id=",
            });
        });

};

exports.find_credit_hours = find_credit_hours;
// Retrieve net hours from salary period

exports.find_net_in_salary_period = async (req, res) => {
    // #swagger.tags = ["Ledger"]
    // #swagger.description = 'Endpoint para obter um usuário.'

    const user_uuid = req.params.UserUUID;
    const period_id = req.params.id;
    function isValidJSONString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    let query = {
        where: {
            Salary_period: {
                [Op.eq]: period_id,
            },
            Account: {
                [Op.eq]: user_uuid,
            },
        },
        attributes: [[sequelize.fn('sum', sequelize.col('Hours')), 'Hours']],
    }
    let filter = '';
    if (isValidJSONString(req.query.filter)) {
        //cool we are valid, lets parse
        filter = JSON.parse(req.query.filter);
        query.where.Type = {
            [Op.eq]: filter,
        }
    }

    try {

        let hours = await ledger.findAll(query)
        res.status(200).json({ Hours: hours[0].Hours });

    } catch (error) {
        console.log(error);
        res.status(400).send({ msg: "Could not get net hours." });

    }
};
