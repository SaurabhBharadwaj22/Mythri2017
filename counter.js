var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CountSchema = new Schema({

counter:{ type: Number},
version:{ type: Number},
count_id:{ type: Number}
},{collection:'userCount'});

var Count = mongoose.model('Count', CountSchema);
module.exports = Count;