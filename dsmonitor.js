/*
 * Created with Sublime Text (buidl 3030).
 * User: soncy
 * Date: 2013-04-30
 * Time: 21:47:44
 * Contact: http://www.qifendi.com
 */
var https = require('https'),
    nodemailer = require('nodemailer'),
    exec = require('child_process').exec;

var URL = 'https://eportal.directspace.net/cart.php?gid=22',
    DEFAULTEMAIL = 'soncy1986@gmail.com',
    DEFAULTUSER = 'directspace',
    DEFULTHOST = 'directspace.net';

var arguments = process.argv,
    currUser = hostName = sendEmailAdress= null,
    email = arguments[2] || DEFAULTEMAIL,
    checkTime = 120, //单位：秒
    test = arguments[3],
    tested = false;

function __istest__() {
    if (tested) return false;

    if (test && (test === '-t' || test === '--test' )) {
        return true;
    }

    if (!test && (email === '-t' || email === '--test')) {
        email = DEFAULTEMAIL;
        return true;
    }

}

function getSourceCode(callback) {
    var content = '';
    https.get(URL, function(res) {
        res.on('data', function(d) {
            content += d.toString();
        });
        res.on('end', function() {
            callback(content);
            res = null;
        });
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
    console.log(nowDate() + ' ======== 本次检查没有放货，' + checkTime + '秒后再次检查 =======');
    setTimeout(start, 1 * checkTime * 1000); // 循环检查
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
        html: '<a href="' + URL + '">Buy</a>',
        body: 'DirectSpace 有货啦！' + URL
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
    currUser = DEFAULTUSER;
    hostName = DEFULTHOST;
}

function start() {
    if (__istest__()) {
        sendEmail();
        console.log("======= 发送测试邮件 =========");
        tested = true;
    }

    getSourceCode(function(data) {
        findSales(data);
        data = null;
    });
}

function getSendEmailAdress(callback) {
    if (currUser && hostName) {
        sendEmailAdress = currUser.trim() + '@' + hostName;
        callback();
    }
}

monitoring();
