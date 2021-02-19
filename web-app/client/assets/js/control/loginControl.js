var login = function(){
    var em = document.getElementById("emailForm").value;
    var psw = document.getElementById("passwordForm").value;  
    var pass = SHA256(psw);
    var account = {
        email : em,
        password : pass
    }
    post("login?next=home.html",account,function (response) {   
        if(response=='nousr'){
             showAlert("Cannot access","Username or password are wrong. Try to retype it",function(){hideElement(document.getElementById("alertScreen"))});
         }   
        else if(response=='nodb'){
            showDbError();
        }
        else if(response=='unactive'){
            showAlert("Cannot access","You must activate your acount first! Check your confirmation email sent at: " + em,function(){hideElement(document.getElementById("alertScreen"))});
        } 
        else{
            var usrdata = new User(response[0].email, response[0].name, response[0].surname, response[0].password, response[0].address, response[0].phone, response[0].walletAmount, 0, response[0].not_mail, response[0].not_whatsapp);
            $.cookie("EasyPayDataAccess", JSON.stringify(usrdata), { path: '/' });
            document.location.href = "home.html";
        }
    });
}

var recoverPassword = function(){
    if(checkInput(document.getElementById("emailForm"))){
        get("resetPassword?email="+document.getElementById("emailForm").value,function(response){
            showAlert("Email sent","If an account with that mail exists, we sent a password reset mail. Check in your mailbox",function(){hideElement(document.getElementById("alertScreen")),"mail.gif","width: 97px;"})
        })
    }
}

var register = function(){
    window.location.href = 'register.html';
}

document.getElementById("loginBtn").onclick = login;
document.getElementById("newAccountBtn").onclick = register;
document.getElementById("recoverBtn").onclick = recoverPassword;
document.getElementById("passwordForm").addEventListener('keyup',function(e){
    if(e.keyCode === 13) {
        login.call();
    }
})