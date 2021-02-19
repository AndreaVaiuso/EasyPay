dataControl();
function loadCodes(){
    get("getCodes?email="+accountData.email,function(response){
        document.getElementById("codeContainer").innerHTML = '';
        for(i=0;i<response.length;i++){
            document.getElementById("codeContainer").innerHTML += '<div><span style="font-weight: bold;">'+response[i].import+'€</span><span>'+response[i].code+'</span></div>';
        }
        if(i==0){
            document.getElementById("codeContainer").innerHTML = '<div><span style="font-weight:bold">No codes available. Try to send some money to someone!</span></div>';
        }
    });
}

var reedem = function(){
    let cod = document.getElementById("reedemCodeForm").value;
    if(checkInput(document.getElementById("reedemCodeForm"))){
        get("reedem?code="+cod+"&email="+accountData.email,function(response){
            if(response=="nodb"){
                showDbError();
            } else if (response=="complete"){
                showAlert("Code redeemed","Your code is successfully redeemed and the value is now available on your wallet",function(){hideElement(document.getElementById("alertScreen"))},"check.gif","width: 90px");
                loadCodes();
            } else if(response =="nocode"){
                showAlert("Code not available","Sorry, your code is not valid or no longer available",function(){hideElement(document.getElementById("alertScreen"))});
            }
        });
    }  
}

document.getElementById("reedemBtn").onclick = reedem;

loadCodes();

