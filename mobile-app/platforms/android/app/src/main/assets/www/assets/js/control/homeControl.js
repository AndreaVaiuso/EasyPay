dataControl();
document.getElementById("money").innerHTML = accountData.walletAmount.toFixed(2) + " €";
document.getElementById("nameLabel").innerHTML = accountData.name + " " + accountData.surname;
document.getElementById("emailLabel").innerHTML = accountData.email;
document.getElementById("addressLabel").innerHTML = accountData.address;
document.getElementById("searchForm").onkeyup = function(){filterHistory(document.getElementById("searchForm").value)};

var paymentsLoaded;
var payments;
var periodicPayments;
var historyNpages;
var periodicNpages;
var elNumb = 10;
var currentHistoryPage = 0;
var currentPeriodicPage = 0;

var showReedemCode = function(){
    wrap("reedem.html","assets/js/control/reedemCodeControl.js");
}
var showManageCards = function(){
    wrap("cards.html","assets/js/control/manageLinkedControl.js");
}
var showEditInfo = function(){
    wrap("edit.html","assets/js/control/manageUserDataControl.js");
}
var exportToPdf = function(){
    var head = '<!DOCTYPE html>'+
    '<html>'+
    '<head>'+
        '<meta charset="utf-8">'+
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">'+
        '<title>web-app</title>'+
        '<link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">'+
        '<link rel="stylesheet" href="assets/fonts/ionicons.min.css">'+
        '<link rel="stylesheet" href="assets/css/Footer-Basic.css">'+
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">'+
        '<link rel="stylesheet" href="assets/css/Navigation-Clean.css">'+
        '<link rel="stylesheet" href="assets/css/style.css">'+
    '</head>'+
    '<body style="background-image: none;"><div id = "page_content">';

    var foot =     '</div>'+
    '<script src="assets/js/jquery.min.js"></script>'+
    '<script src="assets/bootstrap/js/bootstrap.min.js"></script>'+
    '<script src="assets/js/bs-animation.js"></script>'+
    '<script src="assets/js/jquery.cookie.js"></script>'+
    '<script src="assets/js/models.js"></script>'+
    '<script src="assets/js/SHA256.js"></script>'+
    '<script src="assets/js/staticFunc.js"></script>'+
    '<script src="assets/js/control/wrapperControl.js"></script></body></html>';
    var report = {html: head + document.getElementById("historyTable").innerHTML + foot, date : new Date().getTime(), email : accountData.email};
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/toPdf?req='+JSON.stringify(report), true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
       if (this.status == 200) {
          var blob=new Blob([this.response], {type:"application/pdf"});
          var link=document.createElement('a');
          link.href=window.URL.createObjectURL(blob);
          link.download="Report_"+new Date()+".pdf";
          link.click();
       }
    };
    xhr.send();
    //download("toPdf",report,function(response){
    //    var blob=new Blob([response], {type: "application/pdf"});
    //    var link=document.createElement('a');
    //    link.href=window.URL.createObjectURL(blob);
    //    link.download="report.pdf";
    //    link.click();
    //});
}

function loadHistory(pag){
    currentHistoryPage = pag;
    document.getElementById("tableHistoryBody").innerHTML  = '';
    get("getPayment?email="+accountData.email,function(response){
        payments = response.reverse();
        historyNpages = Math.ceil(payments.length/elNumb);
        let x = 0;
        pag == historyNpages-1 ? x= (payments.length % elNumb): x = elNumb;
        if(payments.length!=0){
            for(i=pag*elNumb;i<pag*elNumb+x;i++){
                loadElementInTable(payments[i]);
            }
        }
        document.getElementById("historyPagination").innerHTML = '';
        document.getElementById("historyPagination").innerHTML += '<li class="page-item"><a class="page-link" aria-label="Previous" onclick="loadHistory(0)"><span aria-hidden="true">«</span></a></li>';
        for(i=0;i<historyNpages;i++){
            let style;
            i==currentHistoryPage ? style='background-color:#83F7FF' : style='';
            document.getElementById("historyPagination").innerHTML += '<li class="page-item"><a class="page-link" onclick="loadHistory('+i+')" style="'+style+'">'+(i+1)+'</a></li>';
        }
        document.getElementById("historyPagination").innerHTML += '<li class="page-item"><a class="page-link" aria-label="Next" onclick="loadHistory('+(historyNpages-1)+')"><span aria-hidden="true">»</span></a></li>';
    });
}

function loadElementInTable(cp){
    let date = new Date(cp.date);
    if(Number.parseFloat(cp.import)<0){
        document.getElementById("tableHistoryBody").innerHTML += "<tr><td id ='tableHistoryImport_"+i+"' style='color: red; font-weight: bold; font-size:20'>"+cp.import+"€</td><td>"+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+"</td><td>Addressed to: "+cp.email2+", causal: "+cp.causal+", payment method: "+cp.paymentMethod+"</td></tr>";
    } else {
        document.getElementById("tableHistoryBody").innerHTML += "<tr><td id ='tableHistoryImport_"+i+"' style='color: green; font-weight: bold; font-size:20'>"+cp.import+"€</td><td>"+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+"</td><td>From: "+cp.email2+", causal: "+cp.causal+", payment method: "+cp.paymentMethod+"</td></tr>";
    }
}

function loadPeriodic(pag){
    currentPeriodicPage = pag;
    document.getElementById("tablePeriodicBody").innerHTML  = '';
    get("getPeriodicPayment?email="+accountData.email,function(response){
        periodicPayments = response.reverse();
        periodicNpages = Math.ceil(periodicPayments.length/elNumb);
        let x = 0;
        pag == periodicNpages-1 ? x= (periodicPayments.length % elNumb): x = elNumb;
        if(periodicPayments.length!=0){
            for(i=pag*elNumb;i<pag*elNumb+x;i++){
                let cpp = periodicPayments[i];
                let dt;
                cpp.lastPaymentDate!=0 ? dt = addPeriodicity(cpp.lastPaymentDate,cpp.periodicity) : dt = cpp.startDate;
                let date = new Date(dt);
                document.getElementById("tablePeriodicBody").innerHTML += "<tr><td id ='tablePeriodicImport_"+i+"'>"+cpp.import+"€</td>"+
                "<td>"+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+"</td>"+
                "<td>Addressed to: "+cpp.business+", causal: "+cpp.causal+", payment method: "+JSON.parse(cpp.paymentMethod).name+", "+cpp.limit+" payments left</td>"+
                '<td><button class="btn btn-primary" type="button" style="width: 100%;" onclick="stopPeriodic(\''+cpp.email+'\',\''+cpp.business+'\','+cpp.creationDate+')">End</button></td></tr>';
            }
        }
        document.getElementById("periodicPagination").innerHTML = '';
        document.getElementById("periodicPagination").innerHTML += '<li class="page-item"><a class="page-link" aria-label="Previous" onclick="loadPeriodic(0)"><span aria-hidden="true">«</span></a></li>';
        for(i=0;i<periodicNpages;i++){
            let style;
            i==currentPeriodicPage ? style='background-color:#83F7FF' : style='';
            document.getElementById("periodicPagination").innerHTML += '<li class="page-item"><a class="page-link" onclick="loadPeriodic('+i+')" style="'+style+'">'+(i+1)+'</a></li>';
        }
        document.getElementById("periodicPagination").innerHTML += '<li class="page-item"><a class="page-link" aria-label="Next" onclick="loadPeriodic('+(periodicNpages-1)+')"><span aria-hidden="true">»</span></a></li>';
    });
}

function filterHistory(string){
    if(string){
        string = string.toLowerCase();
        document.getElementById("tableHistoryBody").innerHTML  = '';
        for(i=0;i<payments.length;i++){
            let cp = payments[i];
            let dt = new Date(cp.date);
            let date = dt.getDate() + "/" + (dt.getMonth()+1) + "/" + dt.getFullYear();
            if(cp.email2.toLowerCase().includes(string) || cp.import.toString().includes(string) || cp.paymentMethod.toLowerCase().includes(string) || date.includes(string)){
                loadElementInTable(cp);
            }
        }
    } else{
        let x = 0;
        let pag = 0;
        pag == historyNpages-1 ? x= (payments.length % elNumb) - 1: x = elNumb;
        for(i=pag*elNumb;i<pag*elNumb+x;i++){
            loadElementInTable(payments[i]);
        }
    }
}

function stopPeriodic(email,business,creationDate){
    showChose("Are you sure?","This payment will be stopped",function(){
        hideElement(document.getElementById("choseScreen"));
        get("stopPeriodicPayment?email="+email+"&business="+business+"&creationDate="+creationDate,function(response){
            if(response=='nodb'){
                showDbError();
            } else {
                showAlert("Done","Your periodic payment to " + business + " is now stopped. No further payments will be made",function(){
                    hideElement(document.getElementById("alertScreen")); 
                    loadPeriodic(0);
                },"check.gif","width: 90px");
            }
        });
    },function(){
        hideElement(document.getElementById("choseScreen"));
    })
}

loadCards(false);

loadHistory(0);
loadPeriodic(0);

document.getElementById("reedemCodeBtn").onclick = showReedemCode;
document.getElementById("manageCardsBtn").onclick = showManageCards;
document.getElementById("editInfoBtn").onclick = showEditInfo;
document.getElementById("exportPdfBtn").onclick = exportToPdf;
document.getElementById("searchForm").onkeyup = function(){filterHistory(document.getElementById("searchForm").value)};

function addPeriodicity(date,periodicity){
    switch(periodicity){
        case 0:
        //ADDING ONE WEEEK
        return date += 604800000;
        case 1:
        //ADDING ONE MONTH
        return date += 2628000000;
        case 2:
        //ADDING ONE Y
        return date += 31540000000;
    }
}