
var Message = require('./message');
var Fixture = require('./fixture');
var config = require("./db_config");
var User = require('./user');
var Count = require('./counter');
var Game = require('./game');
var Firebase = require('./firebase');
var assert = require("assert");
var gcm = require('node-gcm');
var sender = new gcm.Sender('AIzaSyA0GzyhJWVfIbcxQv9GogEQVZIpKRiLNyg');

module.exports = function(app,express,io){

// API to add a new user
var api = express.Router();
api.post('/add',function(req,res)
	{
	User.findOne({ 
			mobile: req.body.mobile  // check user already exists or not
		}).select('mobile').exec(function(err, user){
			
			if(err) throw err;

			if(user) {

				res.send({ result:2});			
			}
			else
				{
				
			var user = new User({   //create new user collection
			name:req.body.name,
			
			mobile:req.body.mobile,
			gender:req.body.gender,
			add_no:req.body.addno,
			password:req.body.password,
			mythri_id:req.body.myth,
			
			});
		user.save(function(err){
			if(err){
				res.send(err);
			return;}
			else{  // increment the counter
				Count.update({count_id:100}, { $inc: { counter: 1}},function(err){  
	if(err){
				res.send(err);
			return;}
			
			res.json({result:0});
		});	
			}

		});
			}
			});
	
	});

// API to login user
api.post('/login',function(req,res){
	User.findOne({ 
			mobile: req.body.mobile
		}).select('mobile password name mythri_id login_id ').exec(function(err, user){
			
			if(err) throw err;

			if(!user) {

				res.send({ result:1});			
			}
			else if(user){ 

				var validPassword = user.comparePassword(req.body.password);

				if(!validPassword) {
					res.send({ result:1});
				}
				else
				{
					
					res.send({result:0,user});
				}
			}
});
});


// API to generate mythri ID

api.post('/count',function(req,res){
	
	Count.findOne({ count_id:100 }).select('counter').exec(function(err,count){
					
					if(err){
						res.send(err);
							return;
							}
							else
						{
							res.send(count);	
							}
	});
	
});

//  API to register user for a game
// Use /check url before this
api.post('/addgame',function(req,res){
	var gname = req.body.gname;
	var gtype = req.body.gtype;
	var ggen = req.body.ggen;
	var teamname = req.body.tname;
	var mid = req.body.userid;
	var userevent;

	if(gname.toString().trim() === 'none') {
		userevent = "none"
	}else{
 if (ggen.toString().trim() === 'none') {

	 if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()
	 }
		 else{
		 userevent = gname.toString().trim()+"-"+gtype.toString().trim();
		 }
}
else{
if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()+"-"+ggen.toString().trim();
	 }
	 else
			userevent = gname.toString().trim()+"-"+gtype.toString().trim()+"-"+ggen.toString().trim();
}
	}
			 var game = new Game({
						g_name:gname,
						g_type:gtype,
						g_gen:ggen,
						t_name:teamname			
								});
			game.save(function(err){  // create new game collection
					if(err){
						res.send({message:"team name exist",result:10});
						return;}			
					else{
    
						for(var j=0;j<mid.length;j++){
							var id = mid[j];
							var evnt = userevent;
							var tm = teamname;
						User.update({mythri_id:id},{$push: { games:evnt,teams:tm } },function(err){
						if(err){
								res.send({result:16});
								}								
							
								});
							}	
							res.send({result:11});
						}					
					});

					for(var k=0;k<mid.length;k++){
								var id1 = mid[k];
								message = new Message({
										msg:"you are registered for "+userevent+" with your team "+teamname+".",
										mid:id1
												});
										message.save(function(err){
									if(err){
										res.send(err);
											return;}
											
													});
										}

					
					});



// API to send games and teams of a particular user

api.post('/usergames',function(req,res)
	{
	var mid = req.body.myth;
	User.findOne({ 	mythri_id:mid
									}).select('games teams').exec(function(err, user){
					
					if(err){
						res.send(err);
							return;
							}

					if(!user){
			
						res.json({message:"Not registered in any game" ,result:20});
							}
							else{
								var userArray = [];
								userArray.push(user)
								res.send({userArray,result:0});
							}
									});
										
	});



// API to check weather user is eligible to register in the game or not
// after this goto /addgame url

api.post('/check',function(req,res)
	{
	
	var gname = req.body.gname;
	var gtype = req.body.gtype;
	var ggen = req.body.ggen;
	
	var mid = req.body.userid;
	var userevent;

	if(gname.toString().trim() === 'none') {
		userevent = "none"
	}else{
 if (ggen.toString().trim() === 'none') {

	 if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()
	 }
		 else{
		 userevent = gname.toString().trim()+"-"+gtype.toString().trim();
		 }
}
else{
if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()+"-"+ggen.toString().trim();
	 }
	 else
			userevent = gname.toString().trim()+"-"+gtype.toString().trim()+"-"+ggen.toString().trim();
}
	}

var c=0,a=0,d=0,b=0;
	mid.forEach(function(n){
			
			User.findOne({mythri_id:n}).select('name').exec(function(err,user){
			
			if(err){
				res.send(err);
			}

			c++;
			if(!user){
				a++;			
			}
			
			if(c == mid.length){
				if(a>0){
					console.log("12");
					res.json({result:12});
				}
				else
					userCheck(mid);
								}
			});
				});


				function userCheck(mid){
				if(a==0){
					mid.forEach(function(n){
					
			User.findOne({mythri_id:n,games:userevent}).select('name').exec(function(err,users){
			
			if(err){
				res.send(err);
			}
			d++;
			if(users){
				b++;
				}
			
			if(d == mid.length){
				if(b>0){
					console.log("13");
					 res.json({result:13});
				}
				else{
					console.log("15");
					 res.json({result:15});
				}
			}
			});
				});
				}
				}
	


	
		/*var i;
		var k;
		console.log(mid);
			for(i=0;i<mid.length;i++){
					//check the existence of user 
					User.findOne({ 	mythri_id:mid[i]
									}).select('name').exec(function(err, user){
					
					if(err){
						res.send(err);
							return;
							}

					if(!user){
			
						res.json({message:"user does not exist",result:12});
							}
							});
			}
						// is user already registered in the particular game				}
			if(i== mid.length){
				for(k=0;k<mid.length;k++){
						User.findOne({ mythri_id:mid[k],games:userevent
										}).select('name').exec(function(err, user){
	
					if(err){
						res.send(err);
						return;
								}

					if(user){			
			res.json({message:"user aready registered in this game",result:13,user});}	
			else
				res.json({result:15});
							});
	}
}*/

});


// API to update the tshirt size of the user 

api.post('/tshirt',function(req,res)
	{
var mid = req.body.myth;
var size = req.body.tsize;
User.update({mythri_id:mid}, { $set: { tsize: size}},function(err){
	if(err){
				res.send(err);
			return;}
			else
			res.json({message:"updated",result:5});
	});
	});
// API to check the version of the app
	api.post('/version',function(req,res){
	
	Count.findOne({ count_id:100 }).select('version').exec(function(err,version){
					
					if(err){
						res.send(err);
							return;
							}
							else
						{
							res.send({version});	
							}
	});
	
});




// API to find the name of the users in a particular team
api.post('/userteam',function(req,res)
	{
	var tname = req.body.tname;
	User.find({teams:tname
							}).select('name').exec(function(err, user){
					
					if(err){
						res.send(err);
							return;
							}

					if(!user){
			
						res.json({message:"No user in this team" ,result:25});
							}
							else{
								res.json({user,result:25});
							}
									});
										
	});

// API to update the round of a user

api.post('/updatewinner',function(req,res){

	var gname = req.body.gname;
	var gtype = req.body.gtype;
	var ggen = req.body.ggen;
	var tname = req.body.tname;
	var userevent;
	Game.update({g_name:gname,g_type:gtype,g_gen:ggen,t_name:tname}, { $inc: { wins: 1,round:1},$set:{current:false}},function(err){
	if(err){
				res.send(err);
			return;}

			else{


Fixture.update({team1:tname}, { $set:{current:false,fixed:false}},function(err){
	if(err){
				res.send(err);
			return;}
	});
	Fixture.update({team2:tname}, { $set:{current:false,fixed:false}},function(err){
	if(err){
				res.send(err);
			return;}
	});
				res.json({result:0});
			}
	});

	
	if(gname.toString().trim() === 'none') {
		userevent = "none"
	}else{
 if (ggen.toString().trim() === 'none') {

	 if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()
	 }
		 else{
		 userevent = gname.toString().trim()+"-"+gtype.toString().trim();
		 }
}
else{
if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()+"-"+ggen.toString().trim();
	 }
	 else
			userevent = gname.toString().trim()+"-"+gtype.toString().trim()+"-"+ggen.toString().trim();
}
	}

	User.find({
        teams: tname
    }, function(err, docs) {
        if (err ) {
            console.log(err);
		}
        
       userDetails(docs);
    });
		

		function userDetails(docs) {
        docs.forEach(function(user) {
            var id1 = user.mythri_id;
		message = new Message({
			msg:"Congratulations you have reached the next level of "+userevent+" with your team "+tname+".",
			mid:id1,
			mobile:user.mobile,
			name:user.name
				});
		message.save(function(err){
				if(err){
					res.send(err);
						return;}
											
			});
		});
		}

});


api.post('/updatelooser',function(req,res){

	var gname = req.body.gname;
	var gtype = req.body.gtype;
	var ggen = req.body.ggen;
	var tname = req.body.tname;
	var userevent;
	Game.update({g_name:gname,g_type:gtype,g_gen:ggen,t_name:tname}, { $set: { wins: 0}},function(err){
	if(err){
				res.send(err);
			return;}

			else{

				Fixture.update({team1:tname}, { $set:{current:false,fixed:false}},function(err){
	if(err){
				res.send(err);
			return;}
	});
	Fixture.update({team2:tname}, { $set:{current:false,fixed:false}},function(err){
	if(err){
				res.send(err);
			return;}
	});
				res.json({result:0});

	}
	});

	
	if(gname.toString().trim() === 'none') {
		userevent = "none"
	}else{
 if (ggen.toString().trim() === 'none') {

	 if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()
	 }
		 else{
		 userevent = gname.toString().trim()+"-"+gtype.toString().trim();
		 }
}
else{
if(gtype.toString().trim() === 'none') {
		 userevent = gname.toString().trim()+"-"+ggen.toString().trim();
	 }
	 else
			userevent = gname.toString().trim()+"-"+gtype.toString().trim()+"-"+ggen.toString().trim();
}
	}

	User.find({
        teams: tname
    }, function(err, docs) {
        if (err ) {
            console.log(err);
		}
        
       userDetails(docs);
    });
		

		function userDetails(docs) {
        docs.forEach(function(user) {
            var id1 = user.mythri_id;
		message = new Message({
			msg:"Sorry you lost in "+userevent+" with your team "+tname+".",
			mid:id1,
			mobile:user.mobile,
			name:user.name
				});
		message.save(function(err){
				if(err){
					res.send(err);
						return;}
											
			});
		});
		}

});
// API to get the list of all the users
	api.post('/users',function(req,res)
	{
	User.find({"login_id":1},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		res.json({users});
		});
	});

//API to filter the list of teams 
	api.post('/gameusers',function(req,res)
	{
	Game.find({"g_name":req.body.gname,"g_type":req.body.gtype,"g_gen":req.body.ggen,"wins":req.body.win,"current":false},{"t_name":1,"_id":0},function(err,gamers)
		{
		if(err){
			res.send(err);
			return;
		}

		res.json({gamers});
		});
	});

// API to create  message schema
	api.post('/addmessage',function(req,res){
	
	   Message.find({message: true}, function(err, docs) {
										if (err ) {
										  console.log(err);
											}
		
								 updateUserMessage(docs);
											 });

											 function updateUserMessage(docs) {
												docs.forEach(function(usermsg) {
													User.findOne({ mythri_id:usermsg.mid }).select('mobile name').exec(function(err,user){
					
													if(err){
														res.send(err);
													return;
														}
													else
													{
														Message.update({mid:usermsg.mid,message:true,check:false}, { $set: { mobile:user.mobile,name:user.name,check:true}},function(err){
																if(err){
																		res.send(err);
																		return;}
			
																	console.log("updated");
																		});


																		
					//***********************************************************	
													}
									});
					//------------------------------------------------------------
								});
					 }
					 res.send({result:0});
    });

	

// API to send  message
	api.post('/sendmessage',function(request, response) {
 
   // var msg = "@JSS_Mythri Hey, ";
	var msg = "Hey, ";
    // Use model function to send messages to all subscribers
    Message.sendMessage(msg, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("success");
        }
    });
});


api.post('/teammembers',function(req,res)
	{
	User.find({"teams":req.body.tname},{"name":1,"mythri_id":1,"_id":0},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		res.json({users});
		});
	});

	// API to update the login id
api.post('/update',function(req,res)
	{
Game.find({"current":false},{"current":1,"_id":0},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		else{
			users.forEach(function(n){
Game.update({"wins":2}, { $set: { current:false,round:1,wins:1}},function(err){
	if(err){
				res.send(err);
			return;}
			else
			console.log("updated");
	});
			});
		}
	});
	});

api.post('/registered',function(req,res)
	{
User.find({"games":req.body.gname},{"name":1,"mythri_id":1,"_id":0},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		res.json({users});
		});

	});
api.post('/teamcount',function(req,res){
	Game.count({"g_name":req.body.gname,"g_type":req.body.gtype,"g_gen":req.body.ggen},function(err, count) {
        assert.equal(null, err);
		res.send({ count: count});
	});
});

api.post('/totalcount',function(req,res){
	User.count({ games: { $exists: true, $ne: [] } },function(err, count) {
        assert.equal(null, err);
		res.send({ count: count});
	});
});

api.post('/tupdate',function(req,res){
	User.find({login_id:1},function(err,docs){
	if(err){
				res.send(err);
			return;}
			else{
			docs.forEach(function(tshirt){

				User.update({mobile:tshirt.mobile}, { $set: { tsize:"none"}},function(err){
				if(err){
				res.send(err);
			return;}
			else
			console.log("updated");
	});
			});
			}
	});
});


api.post('/findmobile',function(req,res)
	{
User.find({"mobile":req.body.mobile},{"name":1,"mythri_id":1,"_id":0},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		res.json({users});
		});

	});

	api.post('/findid',function(req,res)
	{
User.find({"mythri_id":req.body.mid},{"name":1,"mobile":1,"games":1,"tsize":1,"gender":1,"mythri_id":1,"_id":0},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		res.json({users});
		});

	});


api.post('/randommessage',function(req,res){
		var game = req.body.gname;
		
User.find({
        games: game
    }, function(err, docs) {
        if (err ) {
            console.log(err);
		}
        
       userDetails(docs);
    });
function userDetails(docs) {
        docs.forEach(function(user) {
            var id1 = user.mythri_id;
		message = new Message({
			msg:" Dear participants Certification and prize distribution is scheduled tomorrow at 11AM.Only those whose Mythri_ID is created are eligible. Winners names will be announced shortly.",
			mid:id1,
			mobile:user.mobile,
			name:user.name
				});
		message.save(function(err){
				if(err){
					res.send(err);
						return;}
				console.log("updated");				
			});
		});
		}
});

api.post('/fixture',function(req,res)
	{
	Game.find({"g_name":req.body.gname,"g_type":req.body.gtype,"g_gen":req.body.ggen},{"g_name":1,"g_type":1,"g_gen":1,"t_name":1,"_id":0},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		userFixture(users);
		});

		function userFixture(users){
		
			users.forEach(function(user)
			{
				User.find({"teams":user.t_name},{"name":1,"mythri_id":1,"add_no":1,"mobile":1,"_id":0},function(err,abc)
		{
		if(err){
			res.send(err);
			return;
		}
		
		console.log(user.g_name,user.g_type,user.g_gen,"  ",user.t_name);
		console.log(abc);
		console.log("-------------------------------------------------------------");
		});
			});

		}
	});

	api.post('/fixmatch',function(req,res){
			var t1 = req.body.team1;
			var t2 = req.body.team2;

			var fixture = new Fixture({   //create new user collection
			g_name:req.body.gname,
			g_type:req.body.gtype,
			g_gen:req.body.ggen,
			round:req.body.round,
			team1:t1,
			team2:t2
			});
		fixture.save(function(err){
			if(err){
				res.send(err);
			return;}
			else
			{
				Game.update({t_name:t1}, { $set: { current:true}},function(err){
				if(err){
				res.send(err);
			return;}
				});
				
				Game.update({t_name:t2}, { $set: { current:true}},function(err){
				if(err){
				res.send(err);
			return;}
				});
				res.json({result:0});
			}
		});				

	});

api.post('/findfixedmatch',function(req,res){

	Fixture.find({"g_name":req.body.gname,"round":req.body.round,"current":true,"fixed":true},{"g_name":1,"g_type":1,"g_gen":1,"team1":1,"team2":1,"_id":0},function(err,match)
		{
		if(err){
			res.send(err);
			return;
		}
		res.json({match});
		});
});

api.post('/notifyuser',function(req,res){
		Message.find({"mid":req.body.myth,"notify":true},{"msg":1,"_id":0},function(err,msg)
		{
		if(err){
			res.send(err);
			return;
		}
		res.json({msg});
		});
});

api.post('/usermobile',function(req,res)
	{
	User.find({"games":req.body.gname},{"name":1,"mythri_id":1,"mobile":1,"add_no":1,"teams":1,"games":1,"_id":0},function(err,users)
		{
		if(err){
			res.send(err);
			return;
		}

		res.json({users});
		});
	});

api.post('/semifinal',function(req,res){

message = new Message({
						msg:req.body.msg,
							mid:req.body.mid
												});
										message.save(function(err){
									if(err){
										res.send(err);
											return;}
											
													});
});

// API to send games and teams of a particular user

api.post('/admin/all/users',function(req,res)
	{
	var mid = req.body.myth;
	if (mid == 3000) {
		User.find().select('name mythri_id mobile add_no games teams').exec(function(err, user){
		
			if(err){
				res.send(err);
					return;
					}

			if(!user){

				res.json({message:"Not registered in any game" ,result:20});
					}
					else{
						var userArray = [];
						userArray.push(user)
						res.send({userArray,result:0});
					}
			});
	}
	else{
		res.json({status: 'Unauthorize Access'});
	}
	
});

api.post('/admin/game/users',function(req,res)
	{
	var mid = req.body.myth;
	if (mid == 3000) {
		User.find({games: {$exists: true, $ne: []}}).select('name mythri_id mobile add_no games teams').exec(function(err, user){
		
			if(err){
				res.send(err);
					return;
					}

			if(!user){

				res.json({message:"Not registered in any game" ,result:20});
					}
					else{
						var userArray = [];
						userArray.push(user)
						res.send({userArray,result:0});
					}
			});
	}
	else{
		res.json({status: 'Unauthorize Access'});
	}
	
});
api.post('/admin/findfixedmatch',function(req,res){
	var mid = req.body.myth;
	if (mid == 3000) {
		Fixture.find({"g_name":req.body.gname,"g_type":req.body.gtype,"g_gen":req.body.ggen,"fixed":true},function(err,match)
			{
			if(err){
				res.send(err);
				return;
			}
			res.json({match});
		});
	}
	else{
		res.json({status: 'Unauthorize Access'});
	}

});
api.post('/admin/add/user',function(req,res)
	{
	var mid = req.body.myth;
	if (mid == 3000) {
		
				
			var user = new User({   //create new user collection
			name:req.body.name,
			
			mobile:req.body.mobile,
			gender:req.body.gender,
			add_no:req.body.addno,
			password:req.body.password,
			mythri_id:3100,
			login_id:req.body.login_type
			});
		user.save(function(err){
			if(err){
				res.send(err);
			return;}
			else{ 
				res.json({result:0});
		}

		});
			
	}
	else{
		return 0;
	}
	
});
api.post('/push/notify',function(req,res){
	var message = new gcm.Message({
	    collapseKey: 'demo',
	    priority: 'high',
	    contentAvailable: true,
	    delayWhileIdle: true,
	    timeToLive: 3,
	    restrictedPackageName: "somePackageName",
	    dryRun: true,
	    data: {
	        key1: 'message1',
	        key2: 'message2'
	    },
	    notification: {
	        title: "Hello, World",
	        icon: "ic_launcher",
	        body: "This is a notification that will be displayed if your app is in the background."
	    }
	});
	var regTokens = ['dA_OKb2mY7k:APA91bFKh0GkOjb2Nx95mixrw1K0nX3Vy7lyqPswa_rX45dCd8D0bePVBvb-silY1Y_MrdFXpeDDTwtzuVDZpMkTu48MAGWroo3J9RpkkZQRlHdKR1u8cBFDvgL3HYoEnt2S4Ybf8kO_'];
	sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if (err){res.json(response); console.error(err);}
    else {res.json({status: 'success'}); console.log(response);}
    // res.json({status: 'success'});
});

});
api.post('/add/firebase/id',function(req,res)
{
	var fb = new Firebase({   
	mythri_id:req.body.myth,
	fb_id:req.body.fb_id,
	});
	fb.save(function(err){
		if(err){
			res.send(err);
		return;}
		else{ 
			res.json({result:0});
		}
	});
	
});
return api;
}