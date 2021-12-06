var mongoose = require("mongoose");

var terminSchema = new mongoose.Schema({
    tip: String,
    ime: String
});

module.exports = mongoose.model("Termin", terminSchema);