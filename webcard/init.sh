#! /bin/sh

pm2 stop all
pm2 start ~/web-card21/webcard/app.js -f
sudo pm2 startup
sudo pm2 save
