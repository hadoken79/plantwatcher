const { check, body, query, validationResult } = require('express-validator'),
    { infoLog, warnLog } = require('../services/loggerService');


const getValRules = (req, res, next) => {

    return [
        query('pId').isLength({ max: 10 }).escape()
    ]
}

const postValRules = (req, res, next) => {

    return [
        body('plantId').isLength({ max: 10 }).escape().trim(),
        body('hum').isLength({ max: 3 }).escape().trim(),
        body('pos').isLength({ max: 3 }).escape().trim(),
        body('active').isLength({ max: 5 }).escape().trim(),
        body('name').isLength({ max: 20 }).escape().trim(),
        body('power').isLength({ max: 3 }).escape().trim(),
        body('date').isLength({ max: 10 }).escape().trim()
    ]
}

const validate = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        infoLog(`VALIDATION-ERROR ${errors[0]}`);
        return res.status(422).send('invalid input');
    }
    return next();

}

module.exports = {
    getValRules,
    postValRules,
    validate

}