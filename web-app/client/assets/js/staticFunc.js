
var selectedMethod;
var payments = new Array();



function readMoney(element){
    return Number.parseFloat((element.value.split('€').join('')).replace(',','.'));
}

function checkInput(...elements){
    try{var valid = true;
        for(i=0;i<elements.length;i++){
            if(!elements[i].value){
                elements[i].style = "border: dashed; border-color: red";
                elements[i].onfocus = function() {
                    this.style = "";
                }
                valid = false;
            } else elements[i].style = "";
            if(elements[i].id == "moneyInput"){
                let val = readMoney(elements[i]);
                if(val <= 0){
                    elements[i].style = "border: dashed; border-color: red";
                    elements[i].onfocus = function() {
                        this.style = "";
                    }
                    valid = false;
                }
            }
            if(elements[i].id == "emailForm" && elements[i].placeholder != "Business name"){
                if(!isEmail(elements[i].value)){
                    elements[i].style = "border: dashed; border-color: red";
                    elements[i].onfocus = function() {
                        this.style = "";
                    }
                    valid = false;
                }
            }
        }
        return valid;} catch(error){

        }
    
}


function showAlert(title, text, close,image,style){
    
    document.getElementById("alertTitle").innerHTML = title;
    document.getElementById("alertText").innerHTML = text;
    document.getElementById("okBtn").onclick = close;
    var icon = document.getElementById("alertIcon");
    if(image!=null){
        icon.src='';
        icon.src= "assets/img/" + image;
        icon.style = style;
    } else {
        icon.src='';
    }
    showElement(document.getElementById("alertScreen"));
    $('html, body').animate({scrollTop:0}, 'fast');
}

function showChose(title, text, yes, no, image, style){
    document.getElementById("choseTitle").innerHTML = title;
    document.getElementById("choseText").innerHTML = text;
    document.getElementById("yesBtn").onclick = yes; 
    document.getElementById("noBtn").onclick = no; 
    var icon = document.getElementById("choseIcon");
    if(image!=null){
        icon.src= "assets/img/" + image;
        icon.style = style;
    } else {
        icon.src='';
    }
    showElement(document.getElementById("choseScreen"));
    $('html, body').animate({scrollTop:0}, 'fast');
}

function showAjaxLoader(){
    document.getElementById("ajaxLoader").style.display = "block";
    $('html, body').animate({scrollTop:0}, 'fast');
}

function hideAjaxLoader(){
    document.getElementById("ajaxLoader").style.display = "none";
}

function showElement(element){
    element.style.display = "block";
    document.getElementById("contentDiv").style.filter = "blur(10px) brightness(50%)";
    blurElement(document.getElementById("contentDiv"),20);
}

function hideElement(element){
    element.style.display = "none";
    document.getElementById("contentDiv").style.filter = "blur(0px) brightness(100%)";
}

function blurElement(element, size) {
    var filterVal = 'blur(' + size + 'px)';
    $(element).css({
        'filter':filterVal,
        'webkitFilter':filterVal,
        'mozFilter':filterVal,
        'oFilter':filterVal,
        'msFilter':filterVal,
        'transition':'all 0.5s ease-out',
        '-webkit-transition':'all 0.5s ease-out',
        '-moz-transition':'all 0.5s ease-out',
        '-o-transition':'all 0.5s ease-out'
    });
}

function setInputFilter(textbox, inputFilter) {
    try{
        ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
            textbox.addEventListener(event, function() {
                if (inputFilter(this.value)) {
                    this.oldValue = this.value;
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                    this.value = this.oldValue;
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                }
            });
        });
    } catch(error){
        textbox.value = '';
    }
}

function wrap(file,script) {
    let url = "/" + file;
    $.get(url,function(data){
        document.getElementById("wrapperDiv").innerHTML = data;
        $.loadScript(script,function(){});
    });
}

function getCardName(cardNumber){
    if(cardNumber.startsWith("37")){
        return "American Express";
    } else if(cardNumber.startsWith("4")){
        return "Visa";
    } else if(cardNumber.startsWith("5")){
        return "Master Card";
    } else if(cardNumber.startsWith("6")){
        return "Discover";
    } else {
        return "Debit/credit card";
    }
}

function setCardIcon(icon, label, cardNumber){
    icon.style = "width: 90px; border-radius: 3px;";
    if(cardNumber.startsWith("37")){
        label.innerHTML = "American Express";
        icon.src = "assets/img/cards/americanexpress.jpg";
    } else if(cardNumber.startsWith("4")){
        label.innerHTML = "Visa";
        icon.src = "assets/img/cards/visa.jpg";
    } else if(cardNumber.startsWith("5")){
        label.innerHTML = "Master Card";
        icon.src = "assets/img/cards/mastercard.jpg";
    } else if(cardNumber.startsWith("6")){
        label.innerHTML = "Discover";
        icon.src = "assets/img/cards/discover.jpg";
    } else {
        label.innerHTML = "Debit/credit card";
        icon.src = "assets/img/cards/card_generic.png";
    }
}

var cardChanged = false;

function setCardBackground(cardNumber){
    if(document.body.clientWidth<768){
        return;
    }
    if(cardNumber.length>3 && !cardChanged){
        cardChanged = true;
        if(cardNumber.startsWith("37")){
            $('#ccard').fadeTo('slow', 0.3, function()
            {
                $(this).css('background-image', 'url(assets/img/cards/template/americanExpress.png)');
            }).fadeTo('slow', 1);
        } else if(cardNumber.startsWith("4")){
            $('#ccard').fadeTo('slow', 0.3, function()
            {
                $(this).css('background-image', 'url(assets/img/cards/template/visa.png)');
            }).fadeTo('slow', 1);
        } else if(cardNumber.startsWith("5")){
            $('#ccard').fadeTo('slow', 0.3, function()
            {
                $(this).css('background-image', 'url(assets/img/cards/template/mastercard.png)');
            }).fadeTo('slow', 1);
        } else if(cardNumber.startsWith("6")){
            $('#ccard').fadeTo('slow', 0.3, function()
            {
                $(this).css('background-image', 'url(assets/img/cards/template/discover.png)');
            }).fadeTo('slow', 1);
        } else {
            $('#ccard').fadeTo('slow', 0.3, function()
            {
                $(this).css('background-image', 'url(assets/img/cards/template/generic_card.png)');
            }).fadeTo('slow', 1);
        }
    }
    if(cardNumber.length<3 && cardChanged){
        cardChanged = false;
        $('#ccard').fadeTo('slow', 0.3, function()
        {
            $(this).css('background-image', 'url(assets/img/cards/template/generic_card.png)');
        }).fadeTo('slow', 1);
    }
    
}

jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

function setPaymentMethod(index){
    selectedMethod = payments[index];
    document.getElementById("paymentMethodDropdown").innerHTML = selectedMethod.name;
}

function loadPaymentMethods(){
    try{
        let cards,banks,wallet;
    get("getCard?email=" + accountData.email,function(response){
        cards = response;
        get("getBank?email=" + accountData.email,function(response2){
            banks = response2;
            
            let favMethod = -1;
            document.getElementById("paymentDropdownMenu").innerHTML = '';
            wallet = new PaymentMethod(0,'def',"My Wallet",{email: accountData.email});
            payments[0] = wallet;
            document.getElementById("paymentDropdownMenu").innerHTML+='<a id="p_def" onclick="setPaymentMethod(0)" class="dropdown-item" role="presentation">'+payments[0].name+'</a>';
            
            
            let j = 1;
            for(i=0;i<cards.length;i++){
                payments[j] = new PaymentMethod(j,'c',getCardName(cards[i].cardNumber) +": *" + cards[i].cardNumber.substr(cards[i].cardNumber.length - 4),cards[i]);
                document.getElementById("paymentDropdownMenu").innerHTML+='<a id="cp_'+i+'" onclick="setPaymentMethod('+j+')" class="dropdown-item" role="presentation">'+payments[j].name+'</a>';
                if(cards[i].fav != 0){
                    favMethod = j;
                } 
                j++;
            }
            for(i=0;i<banks.length;i++){
                payments[j] = new PaymentMethod(j,'b',"Bank account: *" + banks[i].iban.substr(banks[i].iban.length - 5),banks[i]);
                document.getElementById("paymentDropdownMenu").innerHTML+='<a id="bp_'+i+'" onclick="setPaymentMethod('+j+')" class="dropdown-item" role="presentation" >'+payments[j].name+'</a>';
                if(banks[i].fav != 0){
                    favMethod = j;
                }
                j++;
            }
            if(favMethod != -1){
                setPaymentMethod(favMethod);
            } else {
                setPaymentMethod(0); 
            }
            
        });
    });
    } catch(error){

    }
}

function loadCards(edit){
    document.getElementById("cards").innerHTML = '';
    loadLinkedBanks(edit);
}
function loadLinkedBanks(edit){
    get("getBank?email=" + accountData.email,function (response) {   
        let htmltext = '';
        for(i=0; i<response.length; i++){ 
            if(response[i].fav!=0){
                if(edit){
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: gray;"><div style="text-align: center;"><img id="bimg_'+i+'" onclick="setFavorite(\''+response[i].iban+'\')" src="assets/img/bank_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="btitle_'+i+'" class="card-title">Bank Account</h4><p id="fav_'+i+'">Favorite</p><p id="bnum_'+i+'">'+response[i].iban+'</p><button id="bdel_'+i+'" onclick="deleteLinked(\''+response[i].iban+'\')" class="btn btn-primary" type="button" style="width: 100%;margin-bottom: 20px;">Delete</button></div></div>';
                } else {
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: gray;"><div style="text-align: center;"><img id="bimg_'+i+'" src="assets/img/bank_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="btitle_'+i+'" class="card-title">Bank Account</h4><p id="fav_'+i+'">Favorite</p><p id="bnum_'+i+'">'+'...'+response[i].iban.substr(response[i].iban.length - 5)+'</p></div></div>';
                }
                
            } else {
                if(edit){
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: white;"><div style="text-align: center;"><img id="bimg_'+i+'"  onclick="setFavorite(\''+response[i].iban+'\')" src="assets/img/bank_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="btitle_'+i+'" class="card-title">Bank Account</h4><p id="bnum_'+i+'">'+response[i].iban+'</p><button id="bdel_'+i+'" onclick="deleteLinked(\''+response[i].iban+'\')" class="btn btn-primary" type="button" style="width: 100%;margin-bottom: 20px;">Delete</button></div></div>';
                } else {
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: white;"><div style="text-align: center;"><img id="bimg_'+i+'" src="assets/img/bank_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="btitle_'+i+'" class="card-title">Bank Account</h4><p id="bnum_'+i+'">'+'...'+response[i].iban.substr(response[i].iban.length - 5)+'</p></div></div>';
                }
                
            }
        }
        loadLinkedCards(edit);
    });
}

function loadLinkedCards(edit){
    get("getCard?email=" + accountData.email,function (response) {      
        let htmltext = '';
        for(i=0; i<response.length; i++){
            if(response[i].fav!=0){
                if(edit){
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: gray;"><div style="text-align: center;"><img id="img_'+i+'" onclick="setFavorite('+response[i].cardNumber+')" src="assets/img/card_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="title_'+i+'" class="card-title">Title</h4><p id="fav_'+i+'">Favorite</p><p id="num_'+i+'">'+response[i].cardNumber+'</p><button id="del_'+i+'" onclick="deleteLinked('+response[i].cardNumber+')" class="btn btn-primary" type="button" style="width: 100%;margin-bottom: 20px;">Delete</button></div></div>';
                } else {
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: gray;"><div style="text-align: center;"><img id="img_'+i+'" src="assets/img/card_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="title_'+i+'" class="card-title">Title</h4><p id="fav_'+i+'">Favorite</p><p id="num_'+i+'">'+'...'+response[i].cardNumber.substr(response[i].cardNumber.length - 5)+'</p></div></div>';
                }
                
            } else {
                if(edit){
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: white;"><div style="text-align: center;"><img id="img_'+i+'" onclick="setFavorite('+response[i].cardNumber+')" src="assets/img/card_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="title_'+i+'" class="card-title">Title</h4><p id="num_'+i+'">'+response[i].cardNumber+'</p><button id="del_'+i+'" onclick="deleteLinked('+response[i].cardNumber+')" class="btn btn-primary" type="button" style="width: 100%;margin-bottom: 20px;">Delete</button></div></div>';
                } else {
                    document.getElementById("cards").innerHTML += '<div class="card"><div class="card-body" style="background-color: white;"><div style="text-align: center;"><img id="img_'+i+'" src="assets/img/card_generic.png" style="width: 100px;border-radius: 3px;"></div><h4 id="title_'+i+'" class="card-title">Title</h4><p id="num_'+i+'">'+'...'+response[i].cardNumber.substr(response[i].cardNumber.length - 5)+'</p></div></div>';
                }
            }
            setCardIcon(document.getElementById("img_"+i),document.getElementById("title_"+i),response[i].cardNumber);
        }
        if(document.getElementById("cards").innerHTML == ''){
            if(edit){
                document.getElementById("cards").innerHTML = '<p style="font-weight: bold">No card or bank account linked. Try with menu below and add some</p>'
            } else {
                document.getElementById("cards").innerHTML = '<p>No card or bank account linked. Click on manage cards to add cards or bank accounts</p>'
            }
            
        }
    })
}

var passwordChanged = function () {
    var strength = document.getElementById("strength");
    var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
    var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
    var enoughRegex = new RegExp("(?=.{6,}).*", "g");
    var pwd = document.getElementById("passwordForm");
    if (pwd.value.length==0) {
        strength.innerHTML = "Type a Password";
    } else if (false == enoughRegex.test(pwd.value)) {
        strength.innerHTML = "Minimum lenght: 6 characters";
    } else if (strongRegex.test(pwd.value)) {
        strength.innerHTML = "<span style=\"color:green\">Your password rules!</span>";
    } else if (mediumRegex.test(pwd.value)) {
        strength.innerHTML = "<span style=\"color:orange\">Your password is ok</span>";
    } else { 
        strength.innerHTML = "<span style=\"color:red\">You can do better</span>";
    }
}

function isEmail(email){      
    var emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailReg.test(email); 
} 

function post(request,data,success){
    $.ajax({
        url: "http://"+serverAddress+"/"+request,
        type: "POST",
        crossDomain: true,
        data: JSON.stringify(data),
        contentType: "application/json",
        beforeSend: function () {
            showAjaxLoader();
        },
        complete: function () {
            hideAjaxLoader();
        },
        success: success,
        error: function (xhr, status) {
            showConnectionError();
        }
    });
}

function download(request,data,success){
    $.ajax({
        url: "http://"+serverAddress+"/"+request,
        type: "POST",
        crossDomain: true,
        data: JSON.stringify(data),
        contentType: "application/json",
        responseType: 'arraybuffer',
        beforeSend: function () {
            showAjaxLoader();
        },
        complete: function () {
            hideAjaxLoader();
        },
        success: success,
        error: function (xhr, status) {
            showConnectionError();
        }
    });
}

function get(request,success){
    $.ajax({
        url: "http://"+serverAddress+"/"+request,
        type: "GET",
        crossDomain: true,
        contentType: "application/json",
        beforeSend: function () {
            showAjaxLoader();
        },
        complete: function () {
            hideAjaxLoader();
        },
        success: success,
        error: function (xhr, status) {
            showConnectionError();
        }
    });
}

function showDbError(){
    showAlert("Cannot access","There is something wrong with our database. Our fault, sorry.",function(){hideElement(document.getElementById("alertScreen"))});
}

function showConnectionError(){
    showAlert("Connection error","Error during connection with servers. Status: " + status,function(){hideElement(document.getElementById("alertScreen"))});
}