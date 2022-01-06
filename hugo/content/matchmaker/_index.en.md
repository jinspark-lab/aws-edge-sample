+++
title = "Web-based Matchmaker"
url = "/matchmaker"
pre = "<b>1. </b>"
weight = 20
chapter = false
+++

## Create Web-based Matchmaker

- Move to EC2 Console. Click Launch Instances button.

- Select Amazon Linux2 AMI.

- Choose any of instance type and click next.

- Create EC2 on Public Subnet.

- Configuring Instance Details, put below shell script to the User Data.


```sh

#! /bin/sh

echo "Setting up NodeJS Environment"
curl --silent --location https://rpm.nodesource.com/setup_17.x | bash -
yum -y install nodejs

# Dot source the files to ensure that variables are available within the current shell
npm install pm2 -g --unsafe-perm=true --allow-root
npm cache clean --force
# Install webcard matchmaker
cd ~
curl -O "https://d1zrwss8zuawdm.cloudfront.net/web-card21.zip"
unzip web-card21.zip
cd ~/web-card21/webcardmatch/
chmod -R 755 ./node_modules
npm install -g package --unsafe-perm=true --allow-root
# Run pm2
# export BUILD_ID=dontKillMePlease
sudo pm2 start app.js -f
sudo pm2 startup
sudo pm2 save

```

You can also follow this script from cloudinit.sh in source codes.   


<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
