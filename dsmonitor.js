var https = require('https'),
    nodegrass = require('nodegrass'),
    nodemailer = require('nodemailer'),
    exec = require('child_process').exec;

var arguments = process.argv,
    currUser = hostName = sendEmailAdress= null,
    email = arguments[2] || 'soncy1986@gmail.com';

function getSourceCode(callback) {

    nodegrass.get('https://eportal.directspace.net/cart.php?gid=22', function(data, status, headers) {
        callback(data);
    }).on('error', function(e) {
        recheck();
    });
}

function findSales(data) {
    var reg = /(.*?)\((.*?) Available\)(.*?)/,
        count = reg.exec(data);

    if (!count || parseInt(count[2]) < 1) {
        recheck();
    } else {
        console.log(nowDate() + ' ======== 放货了，已发送邮件到:' + email +' =======');
        sendEmail(); 
    }
}

function recheck() {
    console.log(nowDate() + ' ======== 本次检查没有放货，1分钟后再次检查 =======');
    setTimeout(monitoring, 1 * 60 * 1000); // 1分钟检查一次
}

function nowDate() {
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes();

    return [year, month, day].join('-') + ' ' + [hour, minute].join(':');
}

function sendEmail() {
    nodemailer.SMTP = {
        host: 'localhost'
    };

    nodemailer.send_mail({
        sender: sendEmailAdress,
        to: email,
        subject: 'DirectSpace 有货啦！',
        html: '<a href="https://eportal.directspace.net/cart.php?a=add&pid=262">Buy</a>',
        body: 'DirectSpace 有货啦！ https://eportal.directspace.net/cart.php?a=add&pid=262'
    }, function(error, success){
        console.log(error);
        console.log(success);
        console.log('Message ' + success ? 'sent' : 'failed');
    });
}

function monitoring() {
    if (sendEmailAdress) {
        start();
        return;
    }
    execSystemCommand('echo `whoami`', function(error, stdout, stderr) {
        currUser = stdout;
    });
    
    execSystemCommand('hostname', function(error, stdout, stderr) {
        hostName = stdout;
    });
}

function execSystemCommand(command, callback) {
    try{
        exec(command, function(error, stdout, stderr) {
            callback(error, stdout, stderr);
            getSendEmailAdress();
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
    } catch (e) {
        currUser = 'directspace';
        hostName = 'directspace.net';
    }
}

function start() {
    getSourceCode(function(data) {
        findSales(data)
    });
}

function getSendEmailAdress() {
    if (currUser && hostName) {
        sendEmailAdress = currUser.trim() + '@' + hostName;
        start();
    }
}

monitoring();