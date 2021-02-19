var register = function(){
    var email = $("#emailForm").val();
    var name = $("#fNameForm").val();
    var surname = $("#lNameForm").val();
    var psw = $("#passwordForm").val();
    var psw2 = $("#rPasswordForm").val();
    var address = $("#addressForm").val();
    var phone = $("#phoneForm").val();
    var valid = true;
    if(psw.length<6){
        showAlert("Error","Password is too short",function(){hideElement(document.getElementById("alertScreen"))});
        valid = false;
    }
    if(psw != psw2){
        showAlert("Error","Passwords doesn't match",function(){hideElement(document.getElementById("alertScreen"))});
        valid = false;
    }
    else if(!isEmail(email)){
        showAlert("Error","Your email is not a valid email: " + email,function(){hideElement(document.getElementById("alertScreen"))});
        valid = false;
    }
    else if(email==null || name==null ||surname==null||psw==null||psw2==null||address==null||phone==null){
        showAlert("Error","One or more field are not compiled. Please compile all fields",function(){hideElement(document.getElementById("alertScreen"))});
        valid = false;
    }
    
    if(valid){
        var account = new User(email,name,surname,SHA256(psw),address,phone,0,0,1,0,0);
        post("register",account,function (response) {  
            if(response=='dup'){
                showAlert("Duplicate account","There is already an account with that email: " + email,function(){hideElement(document.getElementById("alertScreen"))});
            }
            if(response=='nousr'){
                 showAlert("Cannot access","Username or password are wrong. Try to retype it",function(){hideElement(document.getElementById("alertScreen"))});
             }   
            else if(response=='nodb'){
                showDbError();
            }
            else if(response=='unactive'){
                showAlert("Cannot access","You must activate your acount first! Check your confirmation email sent at: " + em);
            }   
            else if(response=='mailerr'){
                showAlert("Sending mail error","We have got some problems with sending confirmation email. Don't worry, your account is created, we will try later");
            }
            else if(response=='sent'){
                showAlert("Done","Your account is now created. We sent you an activation email here: " + email,function(){document.location.href="index.html"},"mail.gif","width: 97px;");
            }

        });
    }
}


document.getElementById("passwordForm").onkeyup = passwordChanged;
document.getElementById("createAccountBtn").onclick = register;

setInputFilter(document.getElementById("phoneForm"), function(value) {
    return /^\+\d*\.?\d*$/.test(value);
});

