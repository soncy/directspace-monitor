var https = require('https'),
    nodegrass = require('nodegrass'),
    nodemailer = require('nodemailer'),
    exec = require('child_process').exec;

var arguments = process.argv,
    currUser = hostName = sendEmailAdress= null,
    email = arguments[2] || 'soncy1986@gmail.com',
    test = arguments[3],
    isSendTestemail = false;

function __istest__() {

    if (test && (test === '-t' || test === '--test' )) {
        return true;
    }

    if (!test && (email === '-t' || email === '--test')) {
        return true;
    }

}

function getSourceCode(callback) {

    nodegrass.get('https://eportal.directspace.net/cart.php?gid=22', function(data, status, headers) {
        callback(data);
    }).on('error', function(e) {
        recheck();
    });
}

function findSales(data) {
    var reg = /(.*?)DSVPS\.1\<\/strong\>(.*?)\<strong(.*?)/,
        count = reg.exec(data),
        regString = count[2];

    if (~regString.indexOf('em')) {
        var c = /(.*?)\((.*?) Available(.*?)/.exec(regString);
        if (c && parseInt(c[2]) < 1) {
            recheck();
            return;
        } 
    } 
    available();
}

function available() {
    console.log(nowDate() + ' ======== 放货了，已发送邮件到:' + email +' =======');
    sendEmail();
}

function recheck() {
    console.log(nowDate() + ' ======== 本次检查没有放货，1分钟后再次检查 =======');
    setTimeout(start, 1 * 60 * 1000); // 1分钟检查一次
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
        console.log('发送到' + email + '： ' + (error ? '失败，检查sendmail是否安装并启动' : '成功'));
    });
}

function monitoring() {
    execSystemCommand('echo `whoami`', function(stdout) {
        currUser = stdout;
        getSendEmailAdress(function() {
            start();
        });
    });
    
    execSystemCommand('hostname', function(stdout) {
        hostName = stdout;
        getSendEmailAdress(function() {
            start();
        });
    });
}

function execSystemCommand(command, callback) {
    var a = null;
    try{
        a = exec(command, function(error, stdout, stderr) {
            callback(stdout);
            if (error !== null) {
                console.log('exec error: ' + error);
                setDefault();
            }
            a.kill();
        });
    } catch (e) {
        setDefault();
    }
    return a;
}

function setDefault() {
    currUser = 'directspace';
    hostName = 'directspace.net';
}

function start() {
    if (__istest__() && !isSendTestemail) {
        sendEmail();
        console.log("======= 发送测试邮件 =========");
        isSendTestemail = true;
        start();
        return;
    }

    getSourceCode(function(data) {
        findSales(data)
    });
}

function getSendEmailAdress(callback) {
    if (currUser && hostName) {
        sendEmailAdress = currUser.trim() + '@' + hostName;
        callback();
    }
}

monitoring();
