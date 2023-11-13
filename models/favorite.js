const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//one user to many campsites
const favoriteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
      }],
  } 
);


const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
