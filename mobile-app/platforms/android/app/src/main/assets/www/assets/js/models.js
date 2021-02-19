const serverAddress = '5.95.36.133:8001';

class User {
    constructor(email, name, surname, password, address, phone, walletAmount, active, not_mail, not_whatsapp, not_sms) {
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.password = password;
        this.address = address;
        this.phone = phone;
        this.walletAmount = walletAmount;
        this.active = active;
        this.not_mail = not_mail;
        this.not_whatsapp = not_whatsapp;
        this.not_sms = not_sms;
    }
}

class PaymentMethod  {
    constructor(index,type,name,obj){
        this.index = index;
        this.type = type;
        this.name = name;
        this.obj = obj;
    }
}

class Code {
    constructor(email,code,imp){
        this.email = email;
        this.code = code;
        this.import = imp;
    }
}

class LinkedCard {
    constructor(email, number, expdate, secCode, address, holder){
        this.email = email;
        this.number = number;
        this.expdate = expdate;
        this.secCode = secCode;
        this.address = address;
        this.holder = holder;
    }
}

class LinkedBank {
    constructor(email, iban, holder){
        this.email = email;
        this.iban = iban;
        this.holder = holder;
    }
}

class PeriodicPayment{
    constructor(email, business, paymentMethod, causal, periodicity, startDate, limit, imp, creationDate){
        this.email = email;
        this.business = business;
        this.startDate = startDate;
        this.paymentMethod = paymentMethod;
        this.causal = causal;
        this.periodicity = periodicity;
        this.limit = limit;
        this.imp = imp;
        this.creationDate = creationDate;
    }
}

class Payment {
    constructor(email,target,targetType,paymentMethod,causal,imp){
        this.email = email;
        this.target = target;
        this.paymentMethod = paymentMethod;
        this.causal = causal;
        this.imp = imp;
        var d = new Date();
        this.date = d.getTime();
        this.targetType = targetType;
    }
}
