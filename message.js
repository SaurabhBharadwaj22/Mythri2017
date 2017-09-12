var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var twilio = require('twilio');
var config = require('./db_config');

var client = twilio(config.accountSid, config.authToken);

var MessageSchema = new mongoose.Schema({
    mobile: String,
	name:String,
	mid:String,
	msg:String,
    message: {
        type: Boolean,
        default: true
    },
	notify: {
        type: Boolean,
        default: true
    },
	check: {
        type: Boolean,
        default: false
    }
},{ collection: 'userMessage' });

MessageSchema.statics.sendMessage = function(message, callback) {
    
    Message.find({
        message: true
    }, function(err, docs) {
        if (err ) {
            console.log(err);
		}
        // Otherwise send messages 
        sendMessages(docs);
    });

	    function sendMessages(docs) {
        docs.forEach(function(MyMessage) {
            // Create options to send the message
            var options = {
                to: "+91"+MyMessage.mobile,
                from: config.twilioNumber,
                body: message+MyMessage.name+" (Mythri_16_"+MyMessage.mid+") "+MyMessage.msg
				//body: message+MyMessage.name+" "+MyMessage.msg
            };


            // Send the message!
            client.sendMessage(options, function(err, response) {
                if (err) {
                    // Just log it for now
                    console.error(err);
                } else {
                    // Log the last few digits of a phone number
                    Message.update({mid:MyMessage.mid}, { $set: { message:false}},function(err){
												if(err){
													res.send(err);
														return;}
			
														
														});
                    console.log('Message sent ');
                }
            });
        });

        // Don't wait on success/failure, just indicate all messages have been
		// queued for delivery
        callback.call(this);
    }
};

var Message = mongoose.model('Message', MessageSchema);
module.exports = Message;