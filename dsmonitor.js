/*
 * Created with Sublime Text (buidl 3030).
 * User: soncy
 * Date: 2013-04-30
 * Time: 21:47:44
 * Contact: http://www.qifendi.com
 */

var exec      = require('child_process').exec,
    dsmonitor = require('./lib/dsmonitor'),
    log       = dsmonitor.log;

var DEFAULTEMAIL = 'soncy1986@gmail.com',
    DEFAULTUSER  = 'directspace',
    DEFULTHOST   = 'directspace.net';

var arguments   = process.argv,
    currUser    = hostName = sendEmailAdress = null,
    test        = arguments[3];

var conf = {
    url       : "https://eportal.directspace.net/cart.php?gid=22",
    email     : arguments[2] || DEFAULTEMAIL,
    checkTime : 120, //检查间隔，单位：秒
    reg       : [/(.*?)DSVPS\.3\<\/strong\>(.*?)\<strong(.*?)/, /(.*?)\((.*?) Available(.*?)/]
};


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
        conf.sendEmailAdress = currUser.trim() + '@' + hostName;
        dsmonitor.start(conf);
        if (isTest()) {
            log("发送测试邮件");
            dsmonitor.sendEmail({
                test: true
            });   
        }
    }
}

function execSystemCommand(command, callback) {
    try{
        exec(command, function(error, stdout, stderr) {
            callback(stdout);
            if (error !== null) {
                log('exec error: ' + error);
                callback();
            }
        });
    } catch (e) {
        callback();
    }
}

function isTest() {
    // 如果有第三个参数，则判断第三个参数
    if (test && hasTestArgument(test)) {
        return true;
    }

    /* 如果没有第三个参数，则判断第二个参数：email
     * node dsmonitor.js -t 等同于 node dsmonitor DEFAULTEMAIL -t
     */
    if (!test && hasTestArgument(conf.email)) {
        conf.email = DEFAULTEMAIL;
        return true;
    }
}

function hasTestArgument(val) {
    return (val === '-t' || val === '--test');
}

monitoring();