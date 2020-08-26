const dbService = require('../services/dbService');
const botService = require('../services/botService');

const getPlants = (req, res) => {
    //call dbService
    //respond in json
    dbService
        .getPlants()
        .then((plants) => {
            res.send(plants);
        })
        .catch((err) => {
            res.send(err);
        });
};

const getPlantReadings = (req, res) => {
    //console.log(req.query);
    let plantId = req.query.pId;

    dbService
        .getPlantReadings(plantId)
        .then((reading) => {
            res.send(reading);
        })
        .catch((err) => {
            res.send(err);
        });
};

const storeReadings = (req, res) => {


    if (req.body.hum > 101) {//Testvalue always true
        dbService.getPlantName(req.body.plantId).then(name => {
            botService.sendMsg(`Obacht... ${name} hat einen kritisch tiefen Wert (${req.body.hum}) bei der letzten Messung.\n Geh nachsehen.`);
        }).catch(err => {
            botService.sendMsg(`Habe kritische Werte erhalten, kann aber nicht festmachen welche Pflanze, da klemmt was in der Datenbank.\n hier die Meldung:${err}`);
        })

    }

    dbService
        .storeReading(req.body)
        .then((response) => {
            //console.log(response);
            res.status(201).send(
                `answer from backend. ${JSON.stringify(response)}`
            );
            //res.statusCode(201).send('you sended ' + response);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
};

const storePlant = (req, res) => {
    console.log('received');
    console.log(req.body);
    dbService
        .storePlant(req.body)
        .then((response) => {
            console.log('db responded ' + response);
            res.send(response);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
}

const updatePlants = (req, res) => {

    dbService.updatePlants(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
}

const deletePlant = (req, res) => {

    let plantId = req.body.plantId;
    dbService.deletePlant(plantId)
        .then(response => {
            res.send(response);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
}

const getNewId = (req, res) => {

    dbService.getNewId()
        .then((plantId) => {
            res.send(plantId);
        })
        .catch((err) => {
            console.log('error ' + err);
            res.status(500).send(err);
        });
}


module.exports = {
    getPlants,
    getPlantReadings,
    storeReadings,
    updatePlants,
    getNewId,
    storePlant,
    deletePlant
};
