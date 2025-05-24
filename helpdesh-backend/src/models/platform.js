const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    orgId: {
        type: String,
        required: false,
    },
}); 

const Platform = mongoose.model('Platform', platformSchema);

module.exports = Platform;