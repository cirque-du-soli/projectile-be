const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema({
    boardId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    messageText: {
        type: String,
        required: true
    },
    messageDate: {
        type: Date,
        default: Date.now
    }
});

const messageModel = new mongoose.model("Messages", messagesSchema);

module.exports = messageModel;
