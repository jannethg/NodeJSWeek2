const mongoose = require('mongoose');
//import passport
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
     admin: {
        type: Boolean,
        default: false
    }
});


//add passport plugin  - this plugin will also provide us with additional related methods on the schema and model such as the authenticate method
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);