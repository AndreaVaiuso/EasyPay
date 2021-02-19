dataControl();
document.getElementById("emailForm").value = accountData.email;
document.getElementById("fNameForm").value = accountData.name;
document.getElementById("lNameForm").value = accountData.surname;
document.getElementById("addressForm").value = accountData.address;
document.getElementById("phoneForm").value = accountData.phone;
var not_w;
if (accountData.not_whatsapp == 0) not_w = false;
else not_w = true;
document.getElementById("whatsappCheck").checked = not_w;

var not_e;
if (accountData.not_mail == 0) not_e = false;
else not_e = true;
document.getElementById("mailCheck").checked = not_e;

var not_s;
if (accountData.not_sms == 0) not_s = false;
else not_s = true;
document.getElementById("smsCheck").checked = not_s;

var updateUserData = function(){
    try{
        var email, name, surname, address, phone, not_whatsapp, not_mail, not_sms, oldPass, newPass1, newPass2;
        email = document.getElementById("emailForm").value;
        name = document.getElementById("fNameForm").value;
        surname = document.getElementById("lNameForm").value;
        address = document.getElementById("addressForm").value;
        phone = document.getElementById("phoneForm").value;
        if(document.getElementById("whatsappCheck").checked){
            not_whatsapp = 1;
        } else not_whatsapp = 0;
        if(document.getElementById("mailCheck").checked){
            not_mail = 1;
        } else not_mail = 0;
        if(document.getElementById("smsCheck").checked){
            not_sms = 1;
        } else not_sms = 0;
        oldPass = $("#oldPasswordForm").val();
        newPass1 = $("#passwordForm").val();
        newPass2 = $("#rPasswordForm").val();
        var valid = true;
        if(newPass1!=''){
            console.log(newPass1 +" "+newPass2);
            if(SHA256(oldPass)!=accountData.password){
                showAlert("Error","Old password is wrong. Please retype it",function(){hideElement(document.getElementById("alertScreen"))});
                valid = false;
                return;
            }
            if(newPass1.length<6){
                showAlert("Error","Password is too short",function(){hideElement(document.getElementById("alertScreen"))});
                valid = false;
                return;
            }
            if(newPass1 != newPass2){
                showAlert("Error","Passwords doesn't match",function(){hideElement(document.getElementById("alertScreen"))});
                valid = false;
                return;
            }
            if(valid){
                oldPass = newPass1;
                console.log(oldPass);
            }
        }
        if(email==null || name==null ||surname==null||address==null||phone==null){
            showAlert("Error","One or more field are not compiled. Please compile all fields",function(){hideElement(document.getElementById("alertScreen"))});
            valid = false;
            return;
        }
        if(valid){
            let account = new User(email,name,surname,SHA256(oldPass),address,phone,accountData.walletAmount,1,not_mail,not_whatsapp,not_sms);
            post("updateAccount",account,function(response){
                if(response=='nodb'){
                    showDbError();
                }
                else if(response=='complete'){
                    showAlert("Done","Your account is now updated.",function(){hideElement(document.getElementById("alertScreen"))},"check.gif","width: 90px;");
                    
                }
                
            })
            
            
        }
    } catch(e){
        if(e instanceof TypeError){
            showAlert("Error","One or more field are not compiled. Please compile all fields",function(){hideElement(document.getElementById("alertScreen"))});
            console.log(e);
            valid = false;
            return;
        }
    }
    
    
}

document.getElementById("confirmChangesBtn").onclick = updateUserData;
document.getElementById("passwordForm").onkeyup = passwordChanged;

setInputFilter(document.getElementById("phoneForm"), function(value) {
    return /^\+\d*\.?\d*$/.test(value);
});
