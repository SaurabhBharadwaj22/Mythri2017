var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FixtureSchema = new Schema({

g_name:{ type: String, required: true},
g_type:{ type: String, required: true},
g_gen:{ type: String, required: true},
round:{ type: Number, required: true},
current:{type:Boolean,default:true},
fixed:{type:Boolean,default:true},
team1:{ type: String, required: true},
team2:{ type: String, required: true}
},{collection:'userFixtures'});

var Fixture = mongoose.model('Fixture', FixtureSchema);
module.exports = Fixture;