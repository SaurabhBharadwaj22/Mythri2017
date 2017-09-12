var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
//var autoIncrement = require('mongodb-autoincrement');

// create a schema
var UserSchema = new Schema({
  mythri_id: { type: String, required: true,unique: true},
  login_id: { type: Number, required: true, default: 1 },
  name: { type: String, required: true},
  mobile: { type: String, required: true, unique: true },  
  gender: { type: String, required: true},
  password: { type: String, required: true },
  tsize: { type: String,default: "none" },
  date: { type: Date, default: Date.now },
  add_no: { type: String, required: true,unique: true },
  games:  [{ type: String }],
  teams: [{ type: String }]
  
},{ collection: 'userInfo' });


UserSchema.pre('save',function(next){
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.hash(user.password,null,null,function(err,hash)
	{
		if(err) return next(err);

		user.password = hash;
		next();
	});

});



UserSchema.methods.comparePassword = function(password){

var user = this;

return bcrypt.compareSync(password,user.password);
}
var User = mongoose.model('User', UserSchema);

module.exports = User;
