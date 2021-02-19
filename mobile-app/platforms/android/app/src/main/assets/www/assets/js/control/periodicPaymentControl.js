selectedMethod = null;
payments = new Array();
paymentType = 0;
periodicity = 0;

function setPeriodicity(type){
    periodicity = type;
    if(periodicity == 0){
        document.getElementById("periodicityDropdown").innerHTML = "Weekly";
    } else if (periodicity == 1){
        document.getElementById("periodicityDropdown").innerHTML = "Monthly";
    } else {
        document.getElementById("periodicityDropdown").innerHTML = "Yearly";
    }
}

$(function(){
    var dtToday = new Date();
    
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    
    if(month < 10)
    month = '0' + month.toString();
    if(day < 10)
    day = '0' + day.toString();
    
    var maxDate = year + '-' + month + '-' + day;    
    $('#dateInput').attr('min', maxDate);
});

var startPeriodicPayment = function(){ 
    if(checkInput(document.getElementById("businessForm"),document.getElementById("causalForm"),document.getElementById("dateInput"),document.getElementById("moneyInput"))){
        let business = document.getElementById("businessForm").value.toUpperCase();
        let causal = document.getElementById("causalForm").value;
        let limit = 0;
        if(document.getElementById("limitForm").value!=null){
            limit = document.getElementById("limitForm").value;
        } 
        let imp = readMoney(document.getElementById("moneyInput"));
        let date = document.getElementById("dateInput").value;
        let periodicPayment = new PeriodicPayment(accountData.email, business, selectedMethod, causal, periodicity, date, limit, imp, 0);
        console.log(periodicPayment);
        post("startPeriodic",periodicPayment,function(result){
            if(result=='nodb'){
                showDbError();
            } else if(result=='nobusiness'){
                showAlert("No business","No business found with that name. Please try again",function(){hideElement(document.getElementById("alertScreen"))});
            } else if(result=='complete'){
                showAlert("Completed","Your periodic payment will start on: " + document.getElementById("dateInput").value + "<br>To stop it see the periodic payments table on your home page",function(){hideElement(document.getElementById("alertScreen")),"check.gif","width:90px"});
            } else if(result=='dup'){
                showAlert("Payment already done","Try changing causal or business info",function(){hideElement(document.getElementById("alertScreen"))});
            }
        });
    }
    
}

document.getElementById("sendPaymentBtn").onclick = startPeriodicPayment;

setInputFilter(document.getElementById("limitForm"), function(value) {
    return /^[0-9]*$/i.test(value)
});


var endPeriodicPayment = function(){
    //MOVED TO HOME CONTROL   
}

loadPaymentMethods();

setInputFilter(document.getElementById("moneyInput"), function(value) {
    return /^-?\d*[.,]?\d{0,2}€$/.test(value)
});
document.getElementById("moneyInput").onfocus = function() {  
    if(!document.getElementById("moneyInput").value.endsWith("€")){
        document.getElementById("moneyInput").value += "€"; 
    }
}
setInputFilter(document.getElementById("causalForm"), function(value) {
    return /^[a-z0-9 ]*$/i.test(value)
});