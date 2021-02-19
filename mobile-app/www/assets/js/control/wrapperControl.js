var accountData;

function dataControl(){
    try{       
        accountData = $.parseJSON($.cookie("EasyPayDataAccess"));

        get("user?email="+accountData.email,function(result){
            accountData = result;
            $.cookie("EasyPayDataAccess", JSON.stringify(accountData), { path: '/' });
        })
    } catch(err) {
        showAlert("Not logged in","To access this features please login first",function(){document.location.href="index.html"});
    }
}
//dataControl();

function paymentRequestControl(){
    try{
        let payment = $.parseJSON($.cookie("EasyPayPaymentRequest"));
    console.log(payment);
    if(payment){
        document.location.href = "pay.html";
    } else {
        document.location.href = "homescreen.html";
    }
    } catch(err){
        document.location.href = "homescreen.html";
    }
}
//paymentRequestControl();

var logout = function () {
    $.removeCookie('EasyPayDataAccess', { path: '/' });
    document.location.href="index.html";
}
/*
var hideNotif = function () {
    hideElement(document.getElementById("notificationDiv"));
}

var showNotif = function() {
    showElement(document.getElementById("notificationDiv"));
}
document.getElementById("notificationBtn").onclick = showNotif;
document.getElementById("closeNotifBtn").onclick = hideNotif;
*/
var showPeriodicPay = function(){
    document.location.href = "periodicPay.html";
}

var showAskMoney = function(){
    document.location.href = "ask.html";
}

var showSendMoney = function(){
    document.location.href = "pay.html";
}

var showHome = function(){
    document.location.href = "homescreen.html";
}


document.getElementById("periodicPaymentBtn").onclick = showPeriodicPay;
document.getElementById("askForMoneyBtn").onclick = showAskMoney;
document.getElementById("sendMoneyBtn").onclick = showSendMoney;
document.getElementById("logoutBtn").onclick = logout;
document.getElementById("topLogo").onclick = showHome;

