/*
 * Created with Sublime Text (build3031).
 * User: None
 * Date: 2013-05-02
 * Time: 18:35:51
 * Contact: None
 */
var https      = require('https'),
    nodemailer = require('nodemailer');

function DSMonitor() {
    this.config = null;
}

DSMonitor.prototype.start = function(config) {
    var self        = this;
        self.config = config;

    self._getSourceCode(function(data) {
        self._findSales(data);
    });
}

DSMonitor.prototype._getSourceCode = function(callback) {
    var content = '',
        self    = this,
        c       = self.config;

    https.get(c.url, function(res) {
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
    var self      = this,
        c         = self.config,
        count     = c.reg[0].exec(data),
        regString = count[2];

    if (~regString.indexOf('em')) {
        var c = c.reg[1].exec(regString);
        if (c && parseInt(c[2]) < 1) {
            self._recheck();
            return;
        } 
    }
    self._available();
}

DSMonitor.prototype._recheck = function() {
    var self      = this,
        c         = self.config,
        checkTime = c.checkTime;

    log(nowDate() + ':本次检查没有放货，' + checkTime + '秒后再次检查');
    setTimeout(function() {
        self.start.call(self, self.config);
    }, checkTime * 1000); // 循环检查
}

DSMonitor.prototype._available = function() {
    var self = this;
    log(nowDate() + ':放货了，已发送邮件到:' + email);
    self.sendEmail();
}


DSMonitor.prototype.sendEmail = function() {

    var self = this,
        c    = self.config;

    nodemailer.SMTP = {
        host: 'localhost'
    };

    nodemailer.send_mail({
        sender: c.sendEmailAdress,
        to: c.email,
        subject: 'DirectSpace 有货啦！',
        html: '<a href="' + c.url + '">Buy</a>',
        body: 'DirectSpace 有货啦！' + c.url
    }, function(error, success){
        log('发送到' + c.email + '： ' + (error ? '失败，检查sendmail是否安装并启动' : '成功'));
    });
}

var dsmonitor = new DSMonitor();

module.exports = dsmonitor;

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

function log(val) {
    console.log('========== ' + val + ' =============');
}

module.exports.log = log;