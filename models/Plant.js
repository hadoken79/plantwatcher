const mongoose = require('mongoose');

let plantSchema = mongoose.Schema({
    plantId: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    pos: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
    },
});

module.exports = mongoose.model('plants', plantSchema);
