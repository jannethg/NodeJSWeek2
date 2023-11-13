// Schema: In this file, create a new Mongoose Schema named favoriteSchema. 
// The favoriteSchema should have two fields: user and campsites. 
// Both should have the type of mongoose.Schema.Types.ObjectId, and a ref field to their corresponding Model. 
// The campsites field's properties should be enclosed in an array. See the assignment video for a tip on this step. 
// Model: Create and export a Model named Favorite from this Schema.

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
