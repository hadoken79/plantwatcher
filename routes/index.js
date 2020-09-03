const router = require('express').Router(),
    dashboardController = require('../controllers/dashboardController'),
    apiController = require('../controllers/apiController'),
    { postValRules, getValRules, validate, } = require('../middleware/validator');

router.get('/', dashboardController.renderDashboard);

router.get('/api/getPlants', getValRules(), validate, apiController.getPlants);

router.get('/api/getPlantReadings', getValRules(), validate, apiController.getPlantReadings);

router.get('/api/getNewId', getValRules(), validate, apiController.getNewId);

router.post('/api/postReadings', postValRules(), validate, apiController.storeReadings);
router.post('/api/postPlant', postValRules(), validate, apiController.storePlant);
router.post('/api/deletePlant', postValRules(), validate, apiController.deletePlant);

router.post('/api/updatePlants', postValRules(), validate, apiController.updatePlants);


module.exports = router;
