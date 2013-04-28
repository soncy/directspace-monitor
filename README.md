# 监控DirectSpace家年付15刀vps是否有货

## 使用前提
    
安装了`git`，`nodejs`，`sendmail`

## 使用方法

    git clone git://github.com/soncy/directspace-monitor.git
    cd directspace-monitor/
    node dsmonitor.js youremail@email.com 

youremail@email.com替换成接收邮件的邮箱，不填的话会发送到我的邮箱哦，如果发到139的邮箱，就可以设置短信提醒了

建议在screen下启动监控脚本。

邮件标题：`DirectSpace 有货啦！`
