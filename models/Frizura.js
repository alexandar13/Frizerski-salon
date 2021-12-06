var mongoose = require("mongoose");

var frizuraSchema = new mongoose.Schema({
    naziv: String,
    image: String,
});

module.exports = mongoose.model("Frizura", frizuraSchema);