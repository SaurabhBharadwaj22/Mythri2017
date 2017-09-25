var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FBSchema = new Schema({

mythri_id: { type: String, required: true,unique: true},
fb_id:{ type: String, required: true},
},{collection:'userFireBase'});

var Firebase = mongoose.model('Firebase', FBSchema);
module.exports = Firebase;