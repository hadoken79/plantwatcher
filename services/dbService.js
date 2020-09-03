const mongoose = require('mongoose'),
    Plant = require('../models/Plant'),
    Reading = require('../models/Reading'),
    { infoLog, warnLog } = require('./loggerService'),
    sendStatus = require('../server');

let readCount = 0;


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            //cli options
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });
        console.log(`Mongo connected: ${conn.connection.host}`);
    } catch (err) {
        warnLog(`Error at mongoose.connectDB: ${err}`);
        process.exit(1);
    }
};

const getPlants = () => {

    return new Promise((resolve, reject) => {
        Plant.find({ active: true }, (err, plants) => {
            if (err) {
                warnLog(`DB-ERROR at getPlants ${err}`);
                reject(err);
            } else {
                resolve(plants);
            }
        }).sort({ pos: 1 });
    });
};

const getPlantName = (_plantId) => {
    return new Promise((resolve, reject) => {
        Plant.findOne({ plantId: _plantId }, (err, plant) => {
            if (err) {
                warnLog(`DB-ERROR at getPlantName ${err}`);
                reject(err);
            } else {
                resolve(plant.name);
            }
        }).sort({ pos: 1 });
    });
}

const getPlantReadings = (pId) => {

    return new Promise((resolve, reject) => {
        if (!pId) reject('invalid id');
        Reading.find({ plantId: pId }, (err, readings) => {
            if (err) {
                warnLog(`DB-ERROR at getPlantReadings ${err}`);
                reject(err);
            } else {
                resolve(readings);
            }
        })
            .sort({ date: -1 })
            .limit(10);
    });
};

const storeReading = (data) => {
    return new Promise((resolve, reject) => {
        console.log(`received Data ${readCount++}`);
        let incomming = {
            plantId: data.plantId,
            hum: data.hum, //frontend needs value as string anyway
            power: parseInt(data.power, 10),
            date: undefined //use Schemas default
        };


        let reading = new Reading(incomming);
        reading.save((err) => {
            if (err) {
                try {
                    sendStatus.sendMsg(JSON.stringify({ "type": "error", "msg": err }));
                } catch (err) { }
                warnLog(`DB-ERROR at storeReading ${err}`);
                reject(err);
            }
            //send plant together with update message to frontend
            Plant.find({ active: true, plantId: data.plantId }, (err, plant) => {
                if (err) {
                    warnLog(`DB-ERROR at findPlant in StoreReading ${err}`);
                    reject(err);
                } else {
                    //console.log('plants from db ' + plant);
                    try {
                        sendStatus.sendMsg(JSON.stringify({ "type": "update", "plant": plant })); // <---- websocket message to frontend for updating dashboard.
                    } catch (err) { }
                }
            });
            resolve('saved');
        });
    });
};

const storePlant = data => {
    return new Promise((resolve, reject) => {

        let plant = new Plant(data);
        plant.save((err) => {
            if (err) {

                try {
                    sendStatus.sendMsg(JSON.stringify({ "type": "error", "msg": err }));
                } catch{ }
                warnLog(`DB-ERROR at storePlant ${err}`);
                reject(err);
            }

            //send plant together with update message to frontend
            Plant.find({ active: true, plantId: data.plantId }, (err, plant) => {
                if (err) {
                    warnLog(`DB-ERROR at findPlant in storePlant ${err}`);
                    reject(err);
                } else {
                    try {
                        sendStatus.sendMsg(JSON.stringify({ "type": "update", "plant": plant })); // <---- websocket message to frontend for updating dashboard.
                    } catch (err) { }
                }
            });
            resolve('saved');
        });
    });
}

const updatePlants = (data) => {
    return new Promise((resolve, reject) => {
        //console.log('received at updatePlants\n' + data);
        Plant.updateOne({ plantId: data.plantId }, { $set: { name: data.name, pos: data.pos, active: data.active } }, (err, numAffected) => {
            if (err) {
                warnLog(`DB-ERROR at updatePlants ${err}`);
                reject(err)
            } else {
                //send plant together with update message to frontend
                Plant.find({ active: true, plantId: data.plantId }, (err, plant) => {
                    if (err) {
                        warnLog(`DB-ERROR at findPlant in updatePlants ${err}`);
                        reject(err);
                    } else {
                        //console.log('plants from db ' + plant);
                        try {
                            sendStatus.sendMsg(JSON.stringify({ "type": "update", "plant": plant })); // <---- websocket message to frontend for updating dashboard.
                        } catch (err) {
                            console.log('no message: no client connected ' + err);
                        }
                        resolve('ok');
                    }
                });
            }
        })
    })
}

const deletePlant = (plantId) => {
    return new Promise((resolve, reject) => {
        //console.log('received at updatePlants\n' + data);
        Plant.updateOne({ plantId: plantId }, { $set: { active: false } }, (err, numAffected) => {
            if (err) {
                warnLog(`DB-ERROR at deletePlant ${err}`);
                reject(err)
            } else {
                //send plant together with update message to frontend
                resolve('ok');
            }
        })
    })
}

const getNewId = () => {
    return new Promise((resolve, reject) => {
        Plant.find({}, (err, plants) => {
            if (err) {
                warnLog(`DB-ERROR at getNewId ${err}`);
                reject(err);
            } else {
                let currentMaxId;
                if (plants.length < 1) {
                    currentMaxId = 0;//empty db
                } else {
                    currentMaxId = plants[0].plantId;
                }
                let newMaxId = ++currentMaxId;
                resolve(JSON.stringify({ "plantId": newMaxId }));
            }
        }).sort({ plantId: -1 }).limit(1);
    });
}

module.exports = {
    connectDB,
    getPlants,
    getPlantReadings,
    storeReading,
    updatePlants,
    getNewId,
    storePlant,
    deletePlant,
    getPlantName
};
