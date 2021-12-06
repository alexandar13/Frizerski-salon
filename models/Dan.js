var mongoose = require("mongoose");

var danSchema = new mongoose.Schema({
    termini: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Termin"
        }
     ]
});

module.exports = mongoose.model("Dan", danSchema);