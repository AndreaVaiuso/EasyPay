var accountData;

function dataControl(next){
    try{       
        accountData = $.parseJSON($.cookie("EasyPayDataAccess"));
        get("user?email="+accountData.email,function(result){
            accountData = result;
            $.cookie("EasyPayDataAccess", JSON.stringify(accountData), { path: '/' });
            if(next){
                next.call();
            }
        })
    } catch(err) {
        showAlert("Not logged in","To access this features please login first",function(){document.location.href="index.html"});
    }
}
dataControl();
function paymentRequestControl(){
    try{
        let payment = $.parseJSON($.cookie("EasyPayPaymentRequest"));
    console.log(payment);
    if(payment){
        dataControl(wrap("pay.html","assets/js/control/sendMoneyControl.js"));
    } else {
        wrap("homescreen.html","assets/js/control/homeControl.js");
    }
    } catch(err){
        wrap("homescreen.html","assets/js/control/homeControl.js");
    }
}
paymentRequestControl();

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
    dataControl(wrap("periodicPay.html","assets/js/control/periodicPaymentControl.js"));
}

var showAskMoney = function(){
    dataControl(wrap("ask.html","assets/js/control/requestMoneyControl.js"));
}

var showSendMoney = function(){
    dataControl(wrap("pay.html","assets/js/control/sendMoneyControl.js"));
}

var showHome = function(){
    dataControl( wrap("homescreen.html","assets/js/control/homeControl.js"));
}


document.getElementById("periodicPaymentBtn").onclick = showPeriodicPay;
document.getElementById("askForMoneyBtn").onclick = showAskMoney;
document.getElementById("sendMoneyBtn").onclick = showSendMoney;
document.getElementById("logoutBtn").onclick = logout;
document.getElementById("topLogo").onclick = showHome;

