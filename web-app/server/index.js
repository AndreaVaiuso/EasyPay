class User {
	constructor(email, name, surname, password, address, phone, walletAmount, active, not_mail, not_whatsapp,not_sms) {
		this.email = email;
		this.name = name;
		this.surname = surname;
		this.password = password;
		this.address = address;
		this.phone = phone;
		this.walletAmount = walletAmount;
		this.active = active;
		this.not_mail = not_mail;
		this.not_whatsapp = not_whatsapp;
		this.not_sms = not_sms;
	}
}
class Code {
	constructor(email,code,imp){
		this.email = email;
		this.code = code;
		this.import = imp;
	}
}
class Payment {
    constructor(email,target,targetType,paymentMethod,causal,imp){
        this.email = email;
        this.target = target;
        this.paymentMethod = paymentMethod;
        this.causal = causal;
        this.imp = imp;
        var d = new Date();
        this.date = d.getTime();
        this.targetType = targetType;
    }
}





//IMPORT
const setting = require('../settings.json');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const sha = require('./SHA256');

var port = setting.port;
var serverAddress = setting.serverAddress + ":" + port;
const DATABASE_ERROR_RESPONSE = 'nodb';
const SUCCESS_RESPONSE = 'complete';

var messages = null;
//
//INITIALIZING TWILIO SERVICES
try{
	console.log('Adding twilio services');
	var TWILIO_MESSAGING_NUMBER = setting.TWILIO_MESSAGING_NUMBER;
	var TWILIO_MESSAGING_WHATSAPP_NUMBER = setting.TWILIO_MESSAGING_WHATSAPP_NUMBER;
	if(TWILIO_MESSAGING_NUMBER==''){
		console.log("WARNING: No number selected for twilio services. Please set TWILIO_MESSAGING_NUMBER and TWILIO_MESSAGING_WHATSAPP_NUMBER variables on setting.json by adding a compatible Twilio number for sending SMS and whatsapp notifications")
	}
	messages = require('twilio')(setting.TWILIO_ACCOUNT_SID, setting.TWILIO_AUTH_TOKEN);
} catch(error){
	console.log(error + "Error while adding twilio services for messaging");
}
//
//INITIALIZING MAIL SERVICES
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'easypayaccess@gmail.com',
		pass: 'CadillacCTS1#'
	}
});
//
//EXPRESS DECLARATION VARIABLES
const app = express();
app.use(bodyParser.json());
app.use('/', express.static('client'));
app.use(cookieParser());
//
//SERVER CONNECTION
try{
	app.listen(port);
} catch (error){
	if(error.code == 'EADDRINUSE'){
		console.log("Error: That address and port is already in use: " + serverAddress);
	}
}
console.log("Server started successfully: " + serverAddress);
//
//DATABASE CONNECTION
var database = mysql.createConnection({
	host: "localhost",
	user: "easypay",
	password: "easypay"
});

database.connect(function(err) {
	if (err) throw err;
	console.log("Database connected");
});
//
//GET AND POST MANAGING
app.get('/', function(req,res) {
	res.sendFile(path.join(__dirname, '../client', 'index.html'));
});


app.post('/login', function(req,res){
	var usr = req.body;
	database.query("SELECT * FROM ep.user WHERE email='"+ usr.email +"' AND password='"+usr.password+"'",function(err,user){	
		if (err) {
			res.send(DATABASE_ERROR_RESPONSE);
			return;
		};
		if(user==''){
			res.send("nousr");
			return;
		}
		else {
			if(user[0].active == 0){
				res.send("unactive");
			} else {
				res.send(user);
				return;
			}
		}
	});
});

app.get('/resetPassword',function(req,res){
	let email = req.query.email;
	const UID = generateID();
	let psw = sha.SHA256(UID);
	database.query("UPDATE ep.user SET password='"+psw+"' WHERE email='"+email+"'",function(err,response){
		if(err) throw err;
		sendMail(email,"Password reset",generatePasswordRecoverMail(UID));
		res.send(SUCCESS_RESPONSE)
	})
})

app.get('/toPdf',function(req,res){
	var obj = JSON.parse(req.query.req);
	const html = obj.html;
	const date = obj.date;
	const account = obj.email;
	var options = { format: 'Letter' };
	pdf.create(html, options).toFile('./server/report/report_'+date+'_'+account+'.pdf', function(err, resp) {
		if (err) return console.log(err);
		console.log(resp);
		res.contentType("application/pdf");	
		var file = path.join(__dirname, '/report', 'report_'+date+'_'+account+'.pdf');
		res.download(file, function (err) {
			if (err) {
				console.log("Error");
				console.log(err);
			} else {
				console.log("Success");
			}    
	 	});
	  });

})

app.get('/activate',function(req,res){
	const UID = req.query.uid;
	const email = req.query.email;
	var quer = "UPDATE ep.user SET active=1, uid=0 WHERE email='"+email+"' AND uid='"+UID+"'";
	try{
		database.query(quer,function(err,result){
			if(err) throw err;
			res.sendFile(path.join(__dirname, '../client', 'confirmation.html'));
		});
	} catch(err){
		console.log(err);
	}	
});

app.post('/register',function(req,res){
	var usr = req.body;
	const UID = generateID();
	usr.uid = UID;
	database.query("INSERT INTO ep.user (email,name,surname,walletAmount,password,address,phone,active,uid,not_mail,not_whatsapp,not_sms) VALUES ('"+usr.email+"','"+usr.name+"','"+usr.surname+"','"+usr.walletAmount+"','"+usr.password+"','"+usr.address+"','"+usr.phone+"',0,'"+UID+"',"+usr.not_mail+","+usr.not_whatsapp+","+usr.not_sms+")",function(err,result){
		if (err) {
			console.log(err);
			if(err.code='ER_DUP_ENTRY'){
				res.send("dup");
				return;
			}
			res.send(DATABASE_ERROR_RESPONSE);
			return;
		};
		sendMail(usr.email,'Easy pay registration',generateRegisterMail(usr));
		res.send("sent");
	});
});

app.post('/updateAccount',function(req,res){
	var usr = req.body;
	database.query("UPDATE ep.user SET name = '"+usr.name+"',surname = '"+usr.surname+"',walletAmount = '"+usr.walletAmount+"',password = '"+usr.password+"',address = '"+usr.address+"',phone = '"+usr.phone+"',not_mail = "+usr.not_mail+",not_whatsapp = "+usr.not_whatsapp+",not_sms = "+usr.not_sms+" WHERE email='"+usr.email+"'",function(err,result){
		if (err) {
			console.log(err);
			res.send(DATABASE_ERROR_RESPONSE);
			return;
		};
		sendMail(usr.email,'Easy pay notification',generateModificationMail(usr),usr);
		res.send(SUCCESS_RESPONSE);
	});
});

app.post('/addCard',function(req,res){
	let card = req.body;
	try{
		quer = "SELECT number FROM ep.card WHERE number='"+card.number+"' AND expdate='"+card.expdate+"' AND secCode="+card.secCode+" AND holder='"+card.holder+"'";
		console.log(quer);
		database.query(quer,function(err,result){
			if(err) throw err;
			if(result[0]!=null){
				database.query("INSERT INTO ep.linkedcard (email,cardNumber,fav) VALUES ('"+card.email+"','"+card.number+"',0)",function(err2,result){
					if(err){
						console.log(err);
						if(err.code='ER_DUP_ENTRY'){
							res.send("dup");
							return;
						}
						throw err;
					}
					res.send("success");
					return;
				})
			} else{
				res.send("nocard");
				return;
			} 
		})
	} catch(err){
		res.send(DATABASE_ERROR_RESPONSE);
		return
	}
});

app.post('/addBank',function(req,res){
	let bnkaccount = req.body;
	try{
		database.query("SELECT iban FROM ep.bank WHERE iban='"+bnkaccount.iban+"' AND holder='"+bnkaccount.holder+"'",function(err,result){
			if(err) throw err;
			if(result[0]!=null){
				database.query("INSERT INTO ep.linkedbank (email,iban,fav) VALUES ('"+bnkaccount.email+"','"+bnkaccount.iban+"',0)",function(err2,result){
					if(err){
						console.log(err);
						if(err.code='ER_DUP_ENTRY'){
							res.send("dup");
							return;
						}
						throw err;
					}
					res.send("success");
					return;
				})
			} else{
				res.send("nobank");
				return;
			} 
		})
	} catch(err){
		res.send(DATABASE_ERROR_RESPONSE);
		return
	}
});

app.post('/checkPayment',function(req,res){
	let payment = req.body;
	try{
		if(payment.targetType == 0){
			database.query("SELECT name, surname FROM ep.user WHERE email='"+payment.target+"'",function(err,resp){
				if(err) throw err;
				if(resp[0]!=null){
					res.send(resp[0].name + " " + resp[0].surname);
				} else {
					res.send("nousr");
				}
			});
		} else {
			database.query("SELECT name FROM ep.business WHERE name='"+payment.target+"'",function(err,resp){
				if(err) throw err;
				if(resp[0]!=null){
					res.send(resp[0].name);
				} else {
					res.send("nobusiness");
				}
			});
		}
	} catch (error) {
		res.send(DATABASE_ERROR_RESPONSE);
		return;
	}
});

app.post('/invite',function(req,res){
	let payment = req.body;
	let reedemCode = new Code(payment.email,generateReedemCode(),payment.imp);
	takeMoney(payment.paymentMethod,payment.imp,function(){
		console.log("entering function");
		database.query("INSERT INTO ep.code VALUES ('"+reedemCode.email+"','"+reedemCode.code+"',"+reedemCode.import+")",function(err,result){
			if(err){
				res.send(DATABASE_ERROR_RESPONSE);
			}
			sendMail(payment.target,'You recieved a reedem code',generateInviteMail(payment,reedemCode));
			res.send(reedemCode);
		},function(){
			res.send("nomoney");
		});
	});
	
});

app.get('/getCodes',function(req,res){
	let email = req.query.email;
	try{
		database.query("SELECT * FROM ep.code WHERE email='"+email+"'",function(err,response){
			if(err) throw err;
			res.send(response);
		})
	} catch(error){
		console.log(error);
	}
});
app.get('/reedem',function(req,res){
	let code = req.query.code;
	let email = req.query.email;
	try{
		database.query("SELECT * FROM ep.code WHERE code = '"+code+"'",function(error,resultCode){
			if(error) throw error;
			if(resultCode[0]==null){
				res.send('nocode');
			} else {
				database.query("UPDATE ep.user SET walletAmount = walletAmount + "+resultCode[0].import+" WHERE email='"+email+"'",function(error){
					if(error) throw error;
					database.query("DELETE FROM ep.code WHERE code = '"+code+"'",function(error){
						if(error) throw error;
						database.query("SELECT * FROM ep.user WHERE email='"+email+"'",function(error,user){
							if (error) throw err;
							sendMail(email,'Code no longer available',generateCodeMail(resultCode[0],email),user[0]);
							sendSMS('Your code is no longer available because was reedemed by ' + email + '\nValue: ' + resultCode[0].import,user[0].phone,user[0])
							sendWhatsapp('Your code is no longer available because was reedemed by ' + email + '\nValue: ' + resultCode[0].import,user[0].phone,user[0])
							var date = Date.now();
							if(resultCode[0].email!=user[0].email){
								database.query("INSERT INTO ep.payment VALUES ("+date+",'"+resultCode[0].email+"','"+user[0].email+"','Code','Code reedemed','"+resultCode[0].import+"')",function(err,resp){
									if(err) throw err;
									database.query("INSERT INTO ep.payment VALUES ("+date+",'"+user[0].email+"','"+resultCode[0].email+"','Code','Code reedemed','"+(resultCode[0].import - 2*resultCode[0].import)+"')",function(err,resp){
										if(err) throw err;
										res.send(SUCCESS_RESPONSE);
									});
								});
							} else res.send(SUCCESS_RESPONSE);
						});
					})
				});
			}
		});
	} catch(error) {
		console.log(error);
		res.send(DATABASE_ERROR_RESPONSE);
	}
});

app.post('/request',function(req,res){
	sendMail(req.body.target,'Payment request',generatePaymentRequestMail(req.body));
	res.send(SUCCESS_RESPONSE);
});

app.get('/payreq',function(req,res){
	let email = req.query.email;
	let causal = req.query.causal;
	let imp = req.query.import;
	let paymentOpt = {
		email,
		causal,
		imp,
	};
	res.cookie('EasyPayPaymentRequest',JSON.stringify(paymentOpt));
	res.sendFile(path.join(__dirname, '../client', 'home.html'));
});

app.post('/pay',function(req,res){
	pay(req.body,function(){
		res.send(SUCCESS_RESPONSE)
	},function(){
		res.send("nomoney");
	},true);
});

function pay(payment,clb,errclb,sendNotif){
	let user1, user2;
	try{
		database.query("SELECT * FROM ep.user WHERE email='"+payment.email+"'",function(err,result){
			if (err) {
				throw err
			};
			user1 = result[0];
			database.query("SELECT * FROM ep.user WHERE email='"+payment.target+"'",function(err,result){
				if (err) {
					throw err
				};
				user2 = result[0];
				takeMoney(payment.paymentMethod,payment.imp,function(){sendPayment(user1,user2,payment,clb,errclb,sendNotif)},errclb);
			});	
		});
	} catch(error) {
		console.log("CATCHING ERROR IN PAY()");
		errclb.call();
	}
}

function takeMoney(paymentMethod,imp,clb,errclb){
	let quer;
	if(paymentMethod.type=='c') quer = "UPDATE ep.card SET amount = amount - " + imp + " WHERE number='"+paymentMethod.obj.cardNumber+"'";
	if(paymentMethod.type=='b') quer = "UPDATE ep.bank SET amount = amount - " + imp + " WHERE iban='"+paymentMethod.obj.iban+"'";
	if(paymentMethod.type=='def') quer = "UPDATE ep.user SET walletAmount = walletAmount - " + imp + " WHERE email='"+paymentMethod.obj.email+"'";

	database.query(quer,function(err,resp){
		if(err) {
			if(err.code == 'ER_SIGNAL_EXCEPTION'){
				errclb.call();
			} else{
				console.log("THROWING ERROR FROM TAKEMONEY()");
				throw err;
			} 
		} else {
			clb.call();
		}
	});
}

function sendPayment(user1,user2,payment,clb,sendNotif){
	if(sendNotif){
		sendMail(payment.email,'Payment Sent',generatePaymentMail(user1,user2,payment,"sent"),user1);
		sendSMS('Payment of '+payment.imp+'€ is now sent to: ' + payment.target,user1.phone,user1);
		sendWhatsapp('Payment of '+payment.imp+'€ is now sent to: ' + payment.target,user1.phone,user1);
	}
	if(payment.targetType==0){
		database.query("UPDATE ep.user SET walletAmount = walletAmount + " + payment.imp + " WHERE email='"+payment.target+"' ",function(err,resp){
			if(err) throw err;
			if(sendNotif){
				sendMail(payment.target,'Payment recieved',generatePaymentMail(user1,user2,payment,"recieved"),user2);
				sendSMS('You recieved '+payment.imp+'€ from ' + user1.email,user2.phone,user2);
				sendWhatsapp('You recieved '+payment.imp+'€ from ' + user1.email,user2.phone,user2);
			}
		});
	}
	database.query("INSERT INTO ep.payment VALUES ("+payment.date+",'"+payment.email+"','"+payment.target+"','"+payment.paymentMethod.name+"','"+payment.causal+"','"+(payment.imp - 2*payment.imp)+"')",function(err,resp){
		if(err) throw err;
		if(payment.targetType==0){
			database.query("INSERT INTO ep.payment VALUES ("+payment.date+",'"+payment.target+"','"+payment.email+"','Wallet','"+payment.causal+"','"+payment.imp+"')",function(err,resp){
				if(err) throw err;
				clb.call();
			});
		} else {
			clb.call();
		}
	});
}

app.post('/startPeriodic',function(req,res){
	let periodicPayment = req.body;
	if(periodicPayment.limit=='') periodicPayment.limit = 0;
	let date = new Date(periodicPayment.startDate).getTime()
	try{
		let quer = "INSERT INTO ep.periodicpayment VALUES ('"+periodicPayment.email+"','"+periodicPayment.business+"',"+date+",'"+JSON.stringify(periodicPayment.paymentMethod)+"','"+periodicPayment.causal+"',"+periodicPayment.periodicity+","+periodicPayment.limit+","+periodicPayment.imp+",0,1,"+new Date().getTime()+")";
		console.log(quer);
		database.query(quer,function(err,response){
			if(err){
				if(err.code=='ER_NO_REFERENCED_ROW_2'){
					res.send('nobusiness');
					return;
				} else if(err.code=='ER_DUP_ENTRY'){
					res.send('dup');
					return;
				}
				else throw err;
			} 
			res.send(SUCCESS_RESPONSE);
		});
	} catch(error){
		console.log(error);
		res.send(DATABASE_ERROR_RESPONSE);
	}
})

app.get('/getBank',function(req,res){
	try{
		database.query("SELECT * FROM ep.linkedbank WHERE linkedbank.email='"+req.query.email+"'",function(err,response){
			if(err) throw err;
			res.send(response);
		})	
		return;
	} catch (error){
		res.send(DATABASE_ERROR_RESPONSE);
		return;
	}
});

app.get('/getPayment',function(req,res){
	let email = req.query.email;
	try{
		database.query("SELECT * FROM ep.payment WHERE email1='"+email+"'",function(err,response){
			if(err) throw err;
			res.send(response);
		});
	} catch (error){
		res.send(DATABASE_ERROR_RESPONSE);
	}
});

app.get('/getPeriodicPayment',function(req,res){
	let email = req.query.email;
	try{
		database.query("SELECT * FROM ep.periodicpayment WHERE email= '"+email+"'",function(err,response){
			if(err) throw err;
			res.send(response);
		});
	} catch (error){
		res.send(DATABASE_ERROR_RESPONSE);
	}
});

app.get('/stopPeriodicPayment',function(req,res){
	let email = req.query.email;
	let business = req.query.business;
	let creationDate = req.query.creationDate;
	try{
		database.query("DELETE FROM ep.periodicpayment WHERE email='"+email+"' AND business='"+business+"' AND creationDate="+creationDate,function(err,response){
			if(err) throw err;
			res.send(SUCCESS_RESPONSE);
		});
	} catch (error){
		res.send(DATABASE_ERROR_RESPONSE);
	}
});

app.get('/getCard',function(req,res){
	try{
		database.query("SELECT * FROM ep.linkedcard WHERE linkedcard.email='"+req.query.email+"'",function(err,response){
			if(err) throw err;
			res.send(response);
			return;
		});
		return;
	} catch (error){
		res.send(DATABASE_ERROR_RESPONSE);
		return;
	}
});

app.get('/removeLinked',function(req,res){
	try{
		if(/^\d+$/.test(req.query.cardNumber)){
			database.query("DELETE FROM ep.linkedcard WHERE cardNumber='"+req.query.cardNumber+"' AND email='"+req.query.email+"'",function(err,resp){
				res.send(SUCCESS_RESPONSE);
				return;
			})
		} else {
			database.query("DELETE FROM ep.linkedbank WHERE iban='"+req.query.cardNumber+"' AND email='"+req.query.email+"'",function(err,resp){
				res.send(SUCCESS_RESPONSE);
				return;
			})
		}
		
	} catch (error){
		res.send(DATABASE_ERROR_RESPONSE);
		return;
	}
});

app.get('/setFavorite',function(req,res){
	try{
		database.query("UPDATE ep.linkedcard SET fav = 0 WHERE email='"+req.query.email+"'",function(err,resp){
			if(err) throw err;
		});
		database.query("UPDATE ep.linkedbank SET fav = 0 WHERE email='"+req.query.email+"'",function(err,resp){
			if(err) throw err;
		});
		if(/^\d+$/.test(req.query.cardNumber)){
			database.query("UPDATE ep.linkedcard SET fav = 1 WHERE cardNumber='"+req.query.cardNumber+"' AND email='"+req.query.email+"'",function(err,resp){
				res.send(SUCCESS_RESPONSE);
				return;
			})
		} else {
			database.query("UPDATE ep.linkedbank SET fav = 1 WHERE iban='"+req.query.cardNumber+"' AND email='"+req.query.email+"'",function(err,resp){
				res.send(SUCCESS_RESPONSE);
				return;
			})
		}
		
	} catch (error){
		res.send(DATABASE_ERROR_RESPONSE);
		return;
	}
});


//GENERATE UID FUNCTION
function generateID() {
	return Math.random().toString(36).substr(2, 9).toUpperCase() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

//GENERATE REEDEM CODE
function generateReedemCode() {
	return Math.random().toString(36).substr(2, 18).toUpperCase() + Math.random().toString(36).substr(2, 18).toUpperCase();
};

//NOTIF FUNCTIONS
function sendMail(target,subject,body,user) {
	try{
		if(user!=null){
			if(user.not_mail!=0){
				finallySendMail(target,subject,body)
			}
		} else {
			finallySendMail(target,subject,body)
		}
	} catch (error){
		console.log(error);
	}
}

function finallySendMail(target,subject,body){
	var mailOptions = {
		from: 'easypayaccess@gmail.com',
		to: target,
		subject: subject,
		html: body
	};
	transporter.sendMail(mailOptions, function(error, info){
		if(error) throw error;
	});	
	console.log("Mail sent: " + subject + ". To: " + target);
}

function sendSMS(body,target,user){
	if(user!=null){
		if(user.not_whatsapp!=0){
			finallySendSMS(body,target);
		}
	} else {
		finallySendSMS(body,target);
	}
}

function finallySendSMS(body,target){
	messages.messages.create({
		from: TWILIO_MESSAGING_NUMBER,
		body: body,
		to: target
	}).then(message => console.log(message.sid));;
}

function sendWhatsapp(body,target,user){
	if(user!=null){
		if(user.not_whatsapp!=0){
			finallySendSMS(body,target);
		}
	} else {
		finallySendSMS(body,target);
	}
}

function finallySendSMS(body,target){
	messages.messages.create({
		from: TWILIO_MESSAGING_WHATSAPP_NUMBER,
		body: body,
		to: "whatsapp:"+target
	}).then(message => console.log(message.sid));
}

//MAIL BODY CONSTRUCTORS
function generateRegisterMail(account) {
	return getMailHead("Registration") + '<span style="font-size: 20px;font-weight: bold;">Hello '+account.name+'</span><span style="display: block;margin-bottom: 20px;">We was waiting for you! This is your last step, just click on the link below and your account will be activated immediatly! Thanks for choosing us and happy buying online. See you around!</span> <a href="http://'+serverAddress+'/activate?uid='+account.uid+'&email='+account.email+'" style="font-size: 20px;">activate my account</a>'+ getMailFoot()
}

function generateModificationMail(account) {
	return getMailHead("Notification") + '<span style="font-size: 20px;font-weight: bold;">Hello '+account.name+'</span><span style="display: block;margin-bottom: 20px;">We want to inform you that your profile data are now changed. See you around</span> <a href="http://'+serverAddress+'/index.html" style="font-size: 20px;">log me in now</a>'+ getMailFoot()
}

function generatePasswordRecoverMail(password) {
	return getMailHead("Password modification") + '<span style="font-size: 20px;font-weight: bold;">Hello</span><span style="display: block;margin-bottom: 20px;">You asked for a password reset. This is a new password, use it to log in and change it later if you want in account settings<br><br><b>'+password+'</b><br><br> . See you around</span> <a href="http://'+serverAddress+'/index.html" style="font-size: 20px;">log me in now</a>'+ getMailFoot()
}

function generatePaymentMail(account1,account2,payment,type) {
	var dx = new Date(payment.date);
	if(type=="sent"){
		return getMailHead("Notification") +'<span style="font-size: 20px;font-weight: bold;">Hello '+account1.name+'</span><span style="display: block;margin-bottom: 20px;">We want to inform you that your payment of '+payment.imp+'€ is now sent to '+payment.target+'<br>See you around!</span> <a href="http://'+serverAddress+'/index.html" style="font-size: 20px;">log me in now</a>'+ getMailFoot()
	} else {
		return getMailHead("Notification") + '<span style="font-size: 20px;font-weight: bold;">Hello '+account2.name+'</span><span style="display: block;margin-bottom: 20px;">We want to inform you that you recieved from '+payment.email+' the following payment:<br><br>Sum: '+payment.imp+'€.<br>Causal: '+payment.causal+'<br>Date: '+dx.getDate()+'/'+(dx.getMonth()+1)+'/'+dx.getFullYear()+'<br>See you around!</span> <a href="http://'+serverAddress+'/index.html" style="font-size: 20px;">log me in now</a>'+ getMailFoot()
		
	}
}

function generateInviteMail(payment,reedemCode){
	return getMailHead("Notification") + '<span style="font-size: 20px;font-weight: bold;">Hello</span><span style="display: block;margin-bottom: 20px;">'+payment.email+' invited you to join EasyPay! EasyPay is the best way to make and recieve payments. Here you are your code for reedem '+payment.imp+'€!<br><br>'+reedemCode.code+'<br><br>To use it just register into our site and insert it by clicking on \"Reedem Code\" button on your home page! Register now using the link below!</span> <a href="http://'+serverAddress+'/register.html" style="font-size: 20px;">Register me!</a>'+ getMailFoot()
}

function generateCodeMail(code,email){
	return getMailHead("Notification") + '<span style="font-size: 20px;font-weight: bold;">Hello</span><span style="display: block;margin-bottom: 20px;">Your code is no longer available becouse was reedemed from '+email+'<br><br>Code: '+code.code+'<br>Value: '+code.import+'€</span> <a href="http://'+serverAddress+'/login.html" style="font-size: 20px;">Log me in now</a>'+ getMailFoot()
}

function generatePaymentRequestMail(payment){
	return getMailHead("Notification") + '<span style="font-size: 20px;font-weight: bold;">Hello</span><span style="display: block;margin-bottom: 20px;">'+payment.email+' sent you a payment request of '+payment.imp+'€<br>Causal: '+payment.causal+'<br>To pay now click the link below. You need an EasyPay account to complete the payment!</span> <a href="http://'+serverAddress+'/payreq?email='+payment.email+'&causal='+payment.causal+'&import='+payment.imp+'" style="font-size: 20px;">Pay now</a>'+ getMailFoot()
}

function generatePeriodicPaymentMail(periodicPayment,user) {
	var dx = new Date(periodicPayment.date);
	return getMailHead("Notification") +'<span style="font-size: 20px;font-weight: bold;">Hello '+user.name+'</span><span style="display: block;margin-bottom: 20px;">We want to inform you that your '+getPeriodicityType(periodicPayment.periodicity)+' payment of '+periodicPayment.import+'€ is now sent to '+periodicPayment.business+'<br>See you around!</span> <a href="http://'+serverAddress+'/index.html" style="font-size: 20px;">log me in now</a>'+ getMailFoot()
}

function generatePeriodicPaymentReminderMail(periodicPayment,user) {
	var dx = new Date(periodicPayment.date);
	return getMailHead("Reminder") +'<span style="font-size: 20px;font-weight: bold;">Hello '+user.name+'</span><span style="display: block;margin-bottom: 20px;">We want to inform you that your '+getPeriodicityType(periodicPayment.periodicity)+' payment of '+periodicPayment.import+'€ will be sent tomorrow to '+periodicPayment.business+'. Be sure you will have sufficient credit on your account.<br>See you around!</span> <a href="http://'+serverAddress+'/index.html" style="font-size: 20px;">log me in now</a>'+ getMailFoot()
}

function generatePeriodicPaymentErrorMail(periodicPayment,user) {
	var dx = new Date(periodicPayment.date);
	return getMailHead("Payment error") +'<span style="font-size: 20px;font-weight: bold;">Hello '+user.name+'</span><span style="display: block;margin-bottom: 20px;">We want to inform you that your '+getPeriodicityType(periodicPayment.periodicity)+' payment of '+periodicPayment.import+'€ addressed to '+periodicPayment.business+' cannot be sent because your amount available is not sufficient. Please add some money to your account<br>See you around!</span> <a href="http://'+serverAddress+'/index.html" style="font-size: 20px;">log me in now</a>'+ getMailFoot()
}


app.get('/user',function(req,res){
	var quer = "SELECT * FROM ep.user WHERE email='"+req.query.email+"'";
	console.log(quer);
	database.query(quer,function(err,response){
		if (err) {
			throw err
		};
		var usrdata = new User(response[0].email, response[0].name, response[0].surname, response[0].password, response[0].address, response[0].phone, response[0].walletAmount, 0, response[0].not_mail, response[0].not_whatsapp, response[0].noet_sms);
		res.send(usrdata) ;
	});
})



//OTHER FUNCTIONS
function getUserInfo(email, callback){
	database.query("SELECT * FROM ep.user WHERE email='"+email+"'",function(err,result){
		if (err) {
			throw err
		};
		callback(result[0]);
	});
}

function getPeriodicityType(numb){
	if(numb == 0) return 'weekly';
	if(numb == 1) return 'monthly';
	else return 'yearly';
}

function getMailHead(title){
	return '<!DOCTYPE html> <html> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no"> <title>email</title> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"> </head> <body> <div></div> <header style="padding: 20px;background: linear-gradient(120deg,#0d856d,#39b14f);"><span style="color: white;display: block;"><img src="https://i.ibb.co/hBf4dGn/logo1.png" style="width: 184px;filter: brightness(143%);">'+title+'</span></header> <div style="padding: 20px;margin-left: 20px;margin-right: 20px;">'
}

function getMailFoot(){
	return '</div> <script src="assets/js/jquery.min.js"></script> <script src="assets/bootstrap/js/bootstrap.min.js"></script> </body> </html>'
}

//PERIODIC FUNCTIONS

setInterval(function() {
	try{
		database.query("SELECT * FROM ep.periodicpayment",function(err,periodicPayments){
			for(i = 0;i<periodicPayments.length;i++){
				let cpp = periodicPayments[i];
				let queryfoot = "WHERE email='"+cpp.email+"' AND business='"+cpp.business+"' AND creationDate="+cpp.creationDate;
				database.query("SELECT * FROM ep.user WHERE email='"+cpp.email+"'",function(err,user){
					user = user[0];
					let newDate;
					cpp.lastPaymentDate==0 ? newDate = cpp.startDate : newDate = addPeriodicity(cpp.lastPaymentDate,cpp.periodicity);
					if(isInNDays(newDate,0)){
						let quer;
						if(cpp.limit>1){
							quer = "UPDATE ep.periodicpayment SET lastPaymentDate="+newDate+", periodicpayment.limit = periodicpayment.limit - 1, reminded=1 " + queryfoot;
						} else if(cpp.limit == 1) {
							quer = "DELETE FROM ep.periodicpayment " + queryfoot;
						} else if(cpp.limit == 0){
							quer = "UPDATE ep.periodicpayment SET lastPaymentDate="+newDate+", reminded=1 " + queryfoot;
						}
						console.log(quer);
						database.query(quer,function(err,response){
							if(err) throw err;
							let payment = new Payment(cpp.email,cpp.business,1,JSON.parse(cpp.paymentMethod),cpp.causal,cpp.import);
							console.log(payment);
							pay(payment,function(){
								console.log("PAYMENT SENT");
								sendMail(cpp.email,"Payment to " + cpp.business,generatePeriodicPaymentMail(cpp,user),user);
							}, function(){
								console.log("PAYMENT REFUSED")
								sendMail(cpp.email,"Error on payment", generatePeriodicPaymentErrorMail(cpp,user));
								database.query("DELETE FROM ep.periodicpayment "+queryfoot,function(err,response){
									if(err) throw err;});

							},false);
						});
						
					} else if(isInNDays(newDate,1)){
						if(cpp.reminded!=0){
							sendMail(cpp.email,"Reminder: Payment to " + cpp.business,generatePeriodicPaymentReminderMail(cpp,user),user);
							database.query("UPDATE ep.periodicpayment SET reminded=0 "+queryfoot);
						}
					}	
				});
				
			}
		});
	} catch (error){
		console.log(error)
	}
}, 300*1000);

function addPeriodicity(date,periodicity){
	switch(periodicity){
		case 0:
		//ADDING ONE WEEEK
		return date += 604800000;
		case 1:
		//ADDING ONE MONTH
		return date += 2628000000;
		case 2:
		//ADDING ONE Y
		return date += 31540000000;
	}
}

function addDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result.getTime();
}

function isInNDays(date,n){
	let date1 = new Date();
	let date2 = new Date(date);
	date2 = new Date(addDays(date,-n));
	result = date1.getFullYear()==date2.getFullYear() && date1.getMonth()==date2.getMonth() && date1.getDate()==date2.getDate();
	if(result){
		return true;
	} else return false;
}
