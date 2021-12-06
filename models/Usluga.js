var mongoose = require("mongoose");

var uslugaSchema = new mongoose.Schema({
    naziv: String,
    cena: Number,
    trajanje: String,
});

module.exports = mongoose.model("Usluga", uslugaSchema);
