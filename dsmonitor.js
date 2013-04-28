var https = require('https'),
    nodegrass = require('nodegrass'),
    nodemailer = require('nodemailer');

var arguments = process.argv,
    email = arguments[2] || 'soncy1986@gmail.com';

function getSourceCode(callback) {

    nodegrass.get('https://eportal.directspace.net/cart.php?gid=22', function(data, status, headers) {
        callback(data);
    }).on('error', function(e) {
        setTimeout(monitoring, 3000);
    });
}

function findSales(data) {
    var reg = /(.*?)\((.*?) Available\)(.*?)/,
        count = reg.exec(data);

    if (!count || parseInt(count[2]) > 0) {
        setTimeout(monitoring, 3000);
    } else {
        sendEmail(); 
    }
    
}

function sendEmail() {
    console.log('email', email);
    nodemailer.SMTP = {
        host: 'localhost'
    };

    nodemailer.send_mail({
        sender: 'directspace@directspace.net',
        to: email,
        subject: 'DirectSpace',
        html: 'test',
        body: 'test'
    }, function(error, success){
        console.log(error);
        console.log(success);
        console.log('Message ' + success ? 'sent' : 'failed');
    });
}

function monitoring() {
    getSourceCode(function(data) {
        findSales(data)
    });
}

monitoring();