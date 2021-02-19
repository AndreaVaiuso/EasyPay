dataControl();
selectedMethod = null;
payments = new Array();
var paymentType = 0;

var sendMoney = function(){
    var target = document.getElementById("emailForm").value;
    if(paymentType==1){
        target = target.toUpperCase();
    }
    var causal = document.getElementById("causalForm").value;
    var imp = readMoney(document.getElementById("moneyInput"));
    
    if(checkInput(document.getElementById("emailForm"),document.getElementById("causalForm"),document.getElementById("moneyInput"))){
        var payment = new Payment(accountData.email,target,paymentType,selectedMethod,causal,imp);
        if(payment.email == payment.target){
            showAlert("Chose a different user","You cannot send money to yourself!",function(){hideElement(document.getElementById("alertScreen"))});
            return;
        }
        post("checkPayment",payment,function(response){
            if(response=="nousr"){
                showChose("No user found","There are no account with that mail: " + payment.target + ". Do you want to invite and send him a code to reedem your payment?", function(){
                    post("invite",payment,function(response){
                        if(response=="nomoney"){
                            showAlert("Cannot complete your payment","You have not enaugh money to complete this payment. Try with another payment method",function(){hideElement(document.getElementById("alertScreen"))});
                        } else if(response=="nodb") {
                            showDbError();
                        } else {
                            showAlert("Invite sent","You have sent an invite to: " + payment.target + "<br>With the following code: <br><br><b>" + response.code + "</b><br>Value: "+payment.imp+"€<br>You can see and reedem your codes from home page, by clicking \"Reedem code\" button!",function(){hideElement(document.getElementById("alertScreen"))},"mail.gif","width: 97px;");
                        }
                    });
                    hideElement(document.getElementById("choseScreen"));
                },function(){hideElement(document.getElementById("choseScreen"))});
            } else if (response=="nobusiness"){
                showAlert("No business","No business found with that name. Please try again",function(){hideElement(document.getElementById("alertScreen"))});
            } else if (response=="nodb"){
                showDbError();
            } else {
                showChose(document.getElementById("moneyInput").value,"The payment is currently addressed to: " + response + ". Do you want to continue?" ,function(){
                    hideElement(document.getElementById("choseScreen"));
                    post("pay",payment,function(response){
                        if(response=="nomoney"){
                            showAlert("Cannot complete your payment","You have not enaugh money to complete this payment. Try with another payment method",function(){hideElement(document.getElementById("alertScreen"))});
                        } else if(response=="nodb"){
                            showDbError();
                        } else if(response=="complete") {
                            showAlert("Done!","your payment is now completed",function(){
                                hideElement(document.getElementById("alertScreen"));
                                dataControl();
                            }, "check.gif","width: 90px");
                        }
                    })
                }, function() {hideElement(document.getElementById("choseScreen"))});
            }
           
        });
    }
}

function setPaymentType(type){
    paymentType = type;
    if(paymentType == 0){
        document.getElementById("paymentTypeDropdown").innerHTML = "Person";
        document.getElementById("emailForm").placeholder = "Email of beneficiary";
    } else {
        document.getElementById("paymentTypeDropdown").innerHTML = "Business";
        document.getElementById("emailForm").placeholder = "Business name";
    }
}

function loadPaymentRequestData(){
    try{
        let payment = $.parseJSON($.cookie("EasyPayPaymentRequest"));
        $.removeCookie('EasyPayPaymentRequest', { path: '/' });
    if(payment){
        document.getElementById("emailForm").value = payment.email;
        document.getElementById("emailForm").readOnly = true;
        document.getElementById("causalForm").value = payment.causal;
        document.getElementById("causalForm").readOnly = true;
        document.getElementById("moneyInput").value = payment.imp + "€";
        document.getElementById("moneyInput").readOnly = true;
    }
    } catch (error){

    }
}

document.getElementById("moneyInput").onfocus = function() {  
    if(!document.getElementById("moneyInput").value.endsWith("€")){
        document.getElementById("moneyInput").value += "€"; 
    }
}

setInputFilter(document.getElementById("moneyInput"), function(value) {
    return /^-?\d*[.,]?\d{0,2}€$/.test(value)
});

setInputFilter(document.getElementById("causalForm"), function(value) {
    return /^[a-z0-9 ]*$/i.test(value)
});

document.getElementById("sendPaymentBtn").onclick = sendMoney;

loadPaymentMethods();
loadPaymentRequestData();

