const router = require('express').Router(),
    dashboardController = require('../controllers/dashboardController'),
    apiController = require('../controllers/apiController'),
    authMiddleware = require('../middleware/authMiddleware'),
    {
        postValRules,
        getValRules,
        validate,
    } = require('../middleware/validator'),
    { check, body, query, validationResult } = require('express-validator');

router.get('/', dashboardController.renderDashboard);

router.get(
    '/api/getPlants',
    //getValRules(),
    //validate,
    //authMiddleware,
    apiController.getPlants
);

router.get(
    '/api/getPlantReadings',
    //getValRules(),
    //validate,
    //authMiddleware,
    apiController.getPlantReadings
);

router.get('/api/getNewId', apiController.getNewId);

router.post('/api/postReadings', apiController.storeReadings);
router.post('/api/postPlant', apiController.storePlant);
router.post('/api/deletePlant', apiController.deletePlant);

router.post('/api/updatePlants', apiController.updatePlants);

/*
router.get('/', getValRules(), validate, authMiddleware, homeController.renderHome);
router.get('/details', getValRules(), validate, authMiddleware, detailsController.renderDetails);
router.post('/details', postValRules(), validate, authMiddleware, detailsController.updateDetails);


router.get('/archive', authMiddleware, getValRules(), validate, (req, res) => {

  
    switch (req.query.do) {
        case 'Show':
            console.log('Case Anzeigen');
            archiveController.renderArchiveSearch(req, res);
            break;
        case 'Download':
            console.log('Case Herunterladen');
            archiveController.prepareDownload(req, res);
            break;
        case 'Start':
            console.log('Case beginn');
            archiveController.startDownload(req, res);
            break;
        default:
            console.log('Case Default');
            archiveController.renderArchive(req, res);
            break;
    }

});

router.get('/delete', getValRules(), validate, authMiddleware, deleteController.renderDelete);
router.post('/delete', postValRules(), validate, authMiddleware, (req, res) => {
    
    switch (req.body.do) {

        case 'Delete':
            console.log('Case Herunterladen');
            deleteController.prepareDelete(req, res);
            break;
        case 'Start':
            console.log('Case beginn');
            deleteController.startDelete(req, res);
            break;
        default:
            console.log('Case Default');
            deleteController.renderDelete(req, res);
            break;
    }

});

router.get('/login', loginController.renderLogin);
router.post('/login', postValRules(), validate, loginController.submitLogin);



router.get('/logout', loginController.logout);

//------Api Calls von Client-----//
router.get('/api/allProjects', getValRules(), validate, authMiddleware, clientController.getProjectsFromAllChannels);
router.get('/api/channelProjects', getValRules(), validate, authMiddleware, clientController.getProjectsFromDistinctChannel);
*/

module.exports = router;
