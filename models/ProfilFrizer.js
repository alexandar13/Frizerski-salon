var mongoose = require("mongoose");

var profilSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   usluge: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Usluga"
      }
   ],
   ocene: [
      {
      type: Number,
      }
   ],
   frizure: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Frizura"
      }
   ],
   dani: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Dan"
      }
   ],
 
   prosecna_ocena: Number,
   radnoVreme: Number
});

module.exports = mongoose.model("ProfilFrizer", profilSchema);