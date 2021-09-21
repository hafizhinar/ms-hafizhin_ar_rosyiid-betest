const mongoose = require('mongoose');

let counter = 1;
let CountedId = {type: Number, default: () => counter++};

const userSchema = new mongoose.Schema({
    id: CountedId,
    userName: {
        type: String,
        require: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        require: true
    },
    identityNumber: {
        type: String,
        require: true,
        max: 16
    },
    accountNumber: {
        type: String,
        require: true,
        max: 14
    },
    emailAddress: {
        type: String,
        require: true,
        max: 255
    },
});

module.exports = mongoose.model('User', userSchema);