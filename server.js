var express = require("express"),
	mongoose = require('mongoose'),
    morgan = require('morgan'),
	app = express(),
	assert = require("assert"),
	config = require("./db_config");
	var bodyparser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
	 mongoose.connect(config.database,function(err){
	if(err){
		console.log(err);
	}
	else{
		console.log("connected");
	}
});
var api = require('./route')(app,express,io);
app.use('/',api);

http.listen(config.port,function(err){
	if(err)
	{
		console.log(err);
	}
	else
	{
		console.log("listening to port 3000");
	}
});

