/*
 * Created with Sublime Text (buidl 3030).
 * User: soncy
 * Date: 2013-04-30
 * Time: 21:47:44
 * Contact: http://www.qifendi.com
 */
var https      = require('https'),
    nodemailer = require('nodemailer'),
    exec       = require('child_process').exec;

var URL          = 'https://eportal.directspace.net/cart.php?gid=22',
    DEFAULTEMAIL = 'soncy1986@gmail.com',
    DEFAULTUSER  = 'directspace',
    DEFULTHOST   = 'directspace.net';

var arguments   = process.argv,
    currUser    = hostName = sendEmailAdress = null,
    email       = arguments[2] || DEFAULTEMAIL,
    checkTime   = 120, //单位：秒
    test        = arguments[3],
    regForType  = /(.*?)DSVPS\.1\<\/strong\>(.*?)\<strong(.*?)/,
    regForCount = /(.*?)\((.*?) Available(.*?)/;
    

function DSMonitor() {
    this.tested = false;
}

DSMonitor.prototype.start = function() {
    var self = this;

    if (self._istest()) {
        self._sendEmail();
        log("发送测试邮件");
        self.tested = true;
    }

    self._getSourceCode(function(data) {
        self._findSales(data);
    });
}

DSMonitor.prototype._getSourceCode = function(callback) {
    var content = '',
        self = this;

    https.get(URL, function(res) {
        res.on('data', function(d) {
            content += d.toString();
        });
        res.on('end', function() {
            callback(content);
        });
    }).on('error', function(e) {
        self._recheck();
    });
    
}

DSMonitor.prototype._findSales = function(data) {
    var self = this,
        count = regForType.exec(data),
        regString = count[2];

    if (~regString.indexOf('em')) {
        var c = regForCount.exec(regString);
        if (c && parseInt(c[2]) < 1) {
            self._recheck();
            return;
        } 
    }
    self._available();
}

DSMonitor.prototype._recheck = function() {
    var self = this;
    log(nowDate() + ':本次检查没有放货，' + checkTime + '秒后再次检查');
    setTimeout(function() {
        self.start.call(self);
    }, checkTime * 1000); // 循环检查
}

DSMonitor.prototype._available = function() {
    var self = this;
    log(nowDate() + ':放货了，已发送邮件到:' + email);
    self._sendEmail();
}


DSMonitor.prototype._sendEmail = function() {
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
        log('发送到' + email + '： ' + (error ? '失败，检查sendmail是否安装并启动' : '成功'));
    });
}

DSMonitor.prototype._istest = function() {
    var self = this;

    if (self.tested) return false;

    // 如果有第三个参数，则判断第三个参数
    if (test && hasTestArgument(test)) {
        return true;
    }

    /* 如果没有第三个参数，则判断第二个参数：email
     * node dsmonitor.js -t 等同于 node dsmonitor DEFAULTEMAIL -t
     */
    if (!test && hasTestArgument(email)) {
        email = DEFAULTEMAIL;
        return true;
    }
}

// ==========================================================================================

function monitoring() {

    // 获取当前登录用户
    execSystemCommand('echo `whoami`', function(stdout) {
        currUser = stdout || DEFAULTUSER;
        monitorStart();
    });
    
    // 获取当前hostname
    execSystemCommand('hostname', function(stdout) {
        hostName = stdout || DEFULTHOST;
        monitorStart();
    });

}

function monitorStart() {
    if (currUser && hostName) {
        sendEmailAdress = currUser.trim() + '@' + hostName;
        dsmonitor.start();
    }
}

function execSystemCommand(command, callback) {
    try{
        exec(command, function(error, stdout, stderr) {
            callback(stdout);
            if (error !== null) {
                console.log('exec error: ' + error);
                callback();
            }
        });
    } catch (e) {
        callback();
    }
}

function hasTestArgument(val) {
    return (val === '-t' || val === '--test');
}

function log(val) {
    console.log('========== ' + val + ' =============');
}

function nowDate() {
    //日期格式 2013-4-6 4:40
    var d = new Date();
    return [
        [
            d.getFullYear(),
            d.getMonth(),
            d.getDate()
        ].join('-'),
        [
            d.getHours(),
            d.getMinutes()
        ].join(':')
    ].join(' ');
}

var dsmonitor = new DSMonitor();
monitoring();