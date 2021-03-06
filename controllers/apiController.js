const dbService = require('../services/dbService'),
    botService = require('../services/botService'),
    weatherService = require('../services/weatherService'),
    {
        infoLog,
        warnLog
    } = require('../services/loggerService');

const getPlants = (req, res) => {
    //call dbService
    //respond in json


    dbService
        .getPlants()
        .then((plants) => {
            res.send(plants);
        })
        .catch((err) => {
            warnLog(`API-ERROR in getPlants ${err}`);
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
            warnLog(`API-ERROR in getPlantReadings ${err}`);
            res.send(err);
        });
};

const storeReadings = (req, res) => {

    //console.log(req.body);
    if (req.body.hum < 60 || req.body.hum > 90) { //notify user if value is to low or high

        dbService.getPlantName(req.body.plantId).then(name => {

            if (req.body.hum < 60) {
                botService.sendMsg(`Obacht... ${name} hat einen kritisch tiefen Wert (${req.body.hum}) bei der letzten Messung. Geh giessen.`);
            } else {
                botService.sendMsg(`Obacht... ${name} hat einen kritisch hohen Wert (${req.body.hum}) bei der letzten Messung. Wenn das innerhalb der nächsten Tage nicht zurück geht, droht Staunässe!.`);
            }


        }).catch(err => {
            warnLog(`API-ERROR at getPlantname for Bot-Message ${err}`);

            botService.sendMsg(`Habe kritische Werte erhalten, kann aber nicht festmachen welche Pflanze, da klemmt was in der Datenbank.\n hier die Meldung:${err}`);
        })
    }

    dbService
        .storeReading(req.body)
        .then((response) => {
            res.status(201).send(`answer from backend. ${JSON.stringify(response)}`);
            //res.statusCode(201).send('you sended ' + response);
        })
        .catch((err) => {
            warnLog(`API-ERROR at storeReading ${err}`);
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
            warnLog(`API-ERROR at storePlant ${err}`);
            res.status(500).send(err);
        });
}

const updatePlants = (req, res) => {

    dbService.updatePlants(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch((err) => {
            res.status(500).se
            warnLog(`API-ERROR at updatePlant ${err}`);
            nd(err);
        });
}

const deletePlant = (req, res) => {

    let plantId = req.body.plantId;
    dbService.deletePlant(plantId)
        .then(response => {
            res.send(response);
        })
        .catch((err) => {
            warnLog(`API-ERROR at deletePlant ${err}`);
            res.status(500).send(err);
        });
}

const getNewId = (req, res) => {

    dbService.getNewId()
        .then((plantId) => {
            res.send(plantId);
        })
        .catch((err) => {
            warnLog(`API-ERROR at getNewId ${err}`);
            res.status(500).send(err);
        });
}

const getWeatherData = (req, res) => {
    weatherService.getWeatherData()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            warnLog(`WEATHER-ERROR at getWeatherData ${err}`);
            res.status(500).send(err);
        })
};


module.exports = {
    getPlants,
    getPlantReadings,
    storeReadings,
    updatePlants,
    getNewId,
    storePlant,
    deletePlant,
    getWeatherData
};