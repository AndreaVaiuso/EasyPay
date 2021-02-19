var linkCard = function(){
    let number = document.getElementById("cardNumbForm").value.replace(/ /g, '');
    let secCode = document.getElementById("secureCodeForm").value;
    let expDate = document.getElementById("exDateForm").value;
    let address = document.getElementById("addressForm").value;
    let holder = document.getElementById("cardHolderForm").value.toUpperCase();
    if(checkInput(document.getElementById("cardNumbForm"),document.getElementById("secureCodeForm"),document.getElementById("exDateForm"),document.getElementById("addressForm"),document.getElementById("cardHolderForm"))){
        var linkedCard = new LinkedCard(accountData.email,number,expDate,secCode,address,holder)
        post("addCard",linkedCard,function (response) {   
            if(response=='nocard'){
                showAlert("Cannot link","Unable to link your credit/debit card. Check your data",function(){
                    hideElement(document.getElementById("alertScreen"));
                });
            }   
            else if(response=='nodb'){
                showDbError();
            }
            else if(response=='dup'){
                showAlert("Cannot link","You have already linked that card",function(){
                    hideElement(document.getElementById("alertScreen"));
                });
            }
            else if(response=='success'){
                showAlert("Linked!","Now you can use your card to make payments",function(){
                    hideElement(document.getElementById("alertScreen"));
                    loadCards(true);
                    clearForms();
                }, "check.gif","width: 110px");
            }
        });
    }
    
}

var linkBank = function(){
    let iban = document.getElementById("ibanForm").value.toUpperCase();
    let holder = document.getElementById("holderForm").value.toUpperCase();
    if(checkInput(document.getElementById("ibanForm"),document.getElementById("holderForm"))){
        let linkedBank = new LinkedBank(accountData.email,iban,holder);
        post("addBank",linkedBank,function (response) {   
            if(response=='nobank'){
                showAlert("Cannot link","Unable to link your bank account. Check your data",function(){
                    hideElement(document.getElementById("alertScreen"));
                });
            }   
            else if(response=='nodb'){
                showDbError();
            }
            else if(response=='dup'){
                showAlert("Cannot link","You have already linked that bank account",function(){
                    hideElement(document.getElementById("alertScreen"));
                });
            }
            else if(response=='success'){
                showAlert("Linked!","Now you can use your bank account to make payments",function(){
                    hideElement(document.getElementById("alertScreen"));
                    loadCards(true);
                    clearForms();
                }, "check.gif","width: 110px");
            }
        });
    }
}

function deleteLinked(numb){   
    showChose("Are you sure?","The linked card will be deleted",function(){
        get('removeLinked?email=' + accountData.email + '&cardNumber=' + numb,function (response) {   
            hideElement(document.getElementById("choseScreen"));
            loadCards(true);
        });
    },function(){
        hideElement(document.getElementById("choseScreen"));
    })
    
}

function setFavorite(numb){
    get("setFavorite?email=" + accountData.email + "&cardNumber=" + numb,function(response){
        loadCards(true);
    });
}

function clearForms(){
    document.getElementById("cardNumbForm").value = '';
    document.getElementById("secureCodeForm").value = '';
    document.getElementById("exDateForm").value = '';
    document.getElementById("addressForm").value = '';
    document.getElementById("cardHolderForm").value = '';
    document.getElementById("holderForm").value = '';
    document.getElementById("ibanForm").value = '';
}

loadCards(true);

document.getElementById("linkCardBtn").onclick = linkCard;
document.getElementById("linkIbanBtn").onclick = linkBank;

document.getElementById("cardNumbForm").onkeyup = function(){
    let ele = document.getElementById("cardNumbForm");
    ele = ele.value.split('-').join('');    // Remove dash (-) if mistakenly entered.
    let finalVal = ele.match(/\d{1,4}/g).join('   ');
    document.getElementById("cardNumbForm").value = finalVal;
    //setCardIcon(document.getElementById("cardIcon"),document.getElementById("cardlabel"),document.getElementById("cardNumbForm").value);
    setCardBackground(document.getElementById("cardNumbForm").value);
};

document.getElementById("exDateForm").onkeyup = function(){
    let ele = document.getElementById("exDateForm");
    ele = ele.value.split('/').join('');    // Remove dash (-) if mistakenly entered.
    let finalVal = ele.match(/\d{1,2}/g).join('/');
    document.getElementById("exDateForm").value = finalVal;
};

setInputFilter(document.getElementById("secureCodeForm"), function(value) {
    return /^\d*\.?\d*$/.test(value);
});