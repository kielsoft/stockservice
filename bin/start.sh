#!/bin/bash
cd /home/sdslearn/repositories/stockservice/bin
touch ./log/telcohq2_startup.log
service=stock_service
canrestart=1

if (( $(ps -ef | grep -v grep | grep $service | wc -l) > 0 ))
then
    echo "$service is running" >> ./log/service_startup.log
elif (($canrestart == '1'))
then
    echo "$(date) :     $service is started!!!:"  >> ./log/service_startup.log
    nohup npm run start:prod  >> ./log/service_startup.log 2>&1 &
fi
