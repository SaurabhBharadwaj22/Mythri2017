var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({

g_name:{ type: String, required: true},
g_type:{ type: String, required: true},
g_gen:{ type: String, required: true},
t_name: {type:String,unique:true,required: true},
current:{type:Boolean,default:false},
round: {type:Number,default:1 },
wins: {type:Number,default:1 }
},{collection:'userGames'});

var Game = mongoose.model('Game', GameSchema);
module.exports = Game;