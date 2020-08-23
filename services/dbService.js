const mongoose = require('mongoose');
//dbModel
const Plant = require('../models/Plant');
const Reading = require('../models/Reading');
const sendStatus = require('../server');
const bot = require('./botService');


const initDB = async () => {

}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            //cli options
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log(`Mongo connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(`Error at mongoose.connectDB: ${err}`);
        console.log(process.env.MONGO_URL);
        process.exit(1);
    }
};

const getPlants = () => {
    bot.sendMsg('ola');
    return new Promise((resolve, reject) => {
        Plant.find({ active: true }, (err, plants) => {
            if (err) {
                console.log('error at plants from db' + err);
                reject(err);
            } else {
                console.log('plants from db ' + plants);
                resolve(plants);
            }
        }).sort({ pos: 1 });
    });
};

const getPlantReadings = (pId) => {
    //console.log('getMessures called ' + pId);
    return new Promise((resolve, reject) => {
        Reading.find({ plantId: pId }, (err, readings) => {
            if (err) {
                console.log('error from db' + err);
                reject(err);
            } else {
                //console.log('response from db ' + readings);
                resolve(readings);
            }
        })
            .sort({ date: -1 })
            .limit(10);
    });
};

const storeReading = (data) => {
    return new Promise((resolve, reject) => {
        console.log(data);


        if (data.hum < 90) {
            console.log('zu tief');
            //bot.sendMsg('ola');
        }
        let reading = new Reading(data);
        reading.save((err) => {
            if (err) {
                try {
                    sendStatus.sendMsg(JSON.stringify({ "type": "error", "msg": err }));
                } catch{
                    console.log('no message: no client connected or db error');
                }

                reject(err);
            }
            //send plant together with update message to frontend
            Plant.find({ active: true, plantId: data.plantId }, (err, plant) => {
                if (err) {
                    reject(err);
                } else {
                    //console.log('plants from db ' + plant);
                    try {
                        sendStatus.sendMsg(JSON.stringify({ "type": "update", "plant": plant })); // <---- websocket message to frontend for updating dashboard.
                    } catch (err) {
                        console.log('no message: no client connected ' + err);
                    }
                }
            });
            console.log('saved data');
            resolve('saved');
        });
    });
};

const storePlant = data => {
    return new Promise((resolve, reject) => {

        let plant = new Plant(data);
        plant.save((err) => {
            if (err) {
                console.log('ERROR at storing Plant ' + err);
                try {
                    sendStatus.sendMsg(JSON.stringify({ "type": "error", "msg": err }));
                } catch{
                    console.log('no message: no client connected');
                }

                reject(err);
            }

            //send plant together with update message to frontend
            Plant.find({ active: true, plantId: data.plantId }, (err, plant) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        sendStatus.sendMsg(JSON.stringify({ "type": "update", "plant": plant })); // <---- websocket message to frontend for updating dashboard.
                    } catch (err) {
                        console.log('no message: no client connected ' + err);
                    }
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
                reject(err)
            } else {
                //send plant together with update message to frontend
                Plant.find({ active: true, plantId: data.plantId }, (err, plant) => {
                    if (err) {
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
                console.log('error at plants from db' + err);
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
    deletePlant
};
