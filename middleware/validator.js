const { check, body, query, validationResult } = require('express-validator');

//Muss noch angepasst werden
const getValRules = (req, res, next) => {

    return [
        query('do').isLength({ max: 20 }).escape(),
        query('maxDate').isLength({ max: 20 }).escape(),
        query('page').isLength({ max: 20 }).escape()
    ]
}

const postValRules = (req, res, next) => {

    return [
        body('username').isLength({ max: 20 }).escape(),
        body('password').isLength({ max: 20 }).trim(),
        body('do').isLength({ max: 20 }).escape(),
        body('size').isLength({max: 5}).escape().trim(),
        body('sort').isLength({max: 4}).escape().trim(),
        body('text').isLength({max: 100}).escape().trim(),
        body('page').isLength({max: 5}).escape().trim(),
        body('channel').isLength({max: 10}).escape().trim(),
        body('ns_st_ci').isLength({ max: 20 }).escape().trim(),
        body('ns_st_cl').isLength({ max: 20 }).escape().trim(),
        body('ns_st_ct').isLength({ max: 20 }).escape().trim(),
        body('ns_st_stc').isLength({ max: 20 }).escape().trim(),
        body('ns_st_tpr').isLength({ max: 20 }).escape().trim(),
        body('ns_st_tep').isLength({ max: 20 }).escape().trim(),
        body('ns_st_tdt').isLength({ max: 20 }).escape().trim(),
        body('ns_st_ddt').isLength({ max: 20 }).escape().trim(),
        body('ns_st_tm').isLength({ max: 20 }).escape().trim(),
        body('ns_st_st').isLength({ max: 20 }).escape().trim(),
        body('ns_st_pr').isLength({ max: 20 }).escape().trim(),
        body('ns_st_sn').isLength({ max: 20 }).escape().trim(),
        body('ns_st_ep').isLength({ max: 1024 }).escape().trim(),
        body('title').isLength({max: 255}).escape().trim(),
        body('description').isLength({max: 1024}).escape().trim()
    ]
}

const validate = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation ERROR');
        return res.status(422).send('invalid input');
    }
    return next();

}

module.exports = {
    getValRules,
    postValRules,
    validate

}