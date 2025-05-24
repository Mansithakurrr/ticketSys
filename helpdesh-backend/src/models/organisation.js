const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    platformId: {
        type: String,
        required: false,
    },
});

const Organisation = mongoose.model('Organisation', organisationSchema);

module.exports = Organisation;