const mongoose = require('mongoose');

let readingSchema = mongoose.Schema({
    plantId: {
        type: Number,
        required: true,
    },
    hum: {
        type: Number,
        required: true,
    },
    power: {
        type: Number,
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

module.exports = mongoose.model('readings', readingSchema);
