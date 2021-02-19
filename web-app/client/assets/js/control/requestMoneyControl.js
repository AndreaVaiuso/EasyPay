selectedMethod = null;
payments = new Array();

var requestMoney = function(){
    if(checkInput(document.getElementById("emailForm"),document.getElementById("causalForm"),document.getElementById("moneyInput"))){
        let email = document.getElementById("emailForm").value;
        let causal = document.getElementById("causalForm").value;
        let money = readMoney(document.getElementById("moneyInput"));
        var payment = new Payment(accountData.email,email,0,null,causal,money);
        post("checkPayment",payment,function(response){
            if(response =='nodb'){
                showDbError();
            } else {
                var usr;
                if(response=='nousr'){
                    usr = email;
                } else usr = response;
                showChose(document.getElementById("moneyInput").value,"You are sending a request of payment to " + usr + ". Are you sure?",function(){
                    hideElement(document.getElementById("choseScreen"));
                    post("request",payment,function(response){
                        if(response=='nodb'){
                            showDbError();
                        } if(response=='complete') {
                            showAlert("Payment request sent", "Your payment request was successfully sent to " + usr, function(){hideElement(document.getElementById("alertScreen"))},"check.gif","width:90px");
                        }
                    });
                }, function(){hideElement(document.getElementById("choseScreen"))});
            }
        });
    }
}

document.getElementById("askMoneyBtn").onclick = requestMoney;
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
