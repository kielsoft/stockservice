#!/bin/bash
cd $(dirname "$0")
cd ../
mkdir -p logs
touch ./logs/stock_service.log
touch ./logs/git_head.log

processIdentity=stockservice/node_modules
canrestart=1

appPid=$(ps -ef | grep -v grep | grep $processIdentity | awk '{print $2}');

if [ "$(cat 'logs/git_head.log')" != "$(git rev-parse HEAD)" ]
then 
    echo $(git rev-parse HEAD) > ./logs/git_head.log
    if [ $appPid ] 
    then
        echo "[ $appPid ] killing StockService app to reinstall npm packages..."  >> ./logs/stock_service.log
        kill -9 $appPid;
        echo "StockService killed."  >> ./logs/stock_service.log
    fi

    echo "Reloading npm packages..."  >> ./logs/stock_service.log
    npm install
fi

if [ $appPid ] 
then
    echo "[ $appPid $(date) : $(whoami) ] StockService is currently running" >> ./logs/stock_service.log
elif (($canrestart == '1'))
then
    echo "$(date) : $(whoami) : StockService is started!!!:"  >> ./logs/stock_service.log
    nohup npm run start:prod  >> ./logs/stock_service.log 2>&1 &
fi
