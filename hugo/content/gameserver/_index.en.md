+++
title= "Build Game Server"
url= "/gameserver"
pre= "<b>3. </b>"
weight= 40
chapter= false
+++

## Build Game Server on AWS

- Move to VPC Console. Create Private Subnet from your VPC.

- Move to EC2 Console. Click Launch Instances button.

- Select Amazon Linux2 AMI.

- Choose any of instance type and click next.

- Create EC2 on your Private Subnet. This subnet can be different from Matchmaker's subnet.

- Configuring Instance Details, put below shell script to the User Data.

```sh

#! /bin/sh

echo "Setting up NodeJS Environment"
curl --silent --location https://rpm.nodesource.com/setup_17.x | bash -
yum -y install nodejs

# Dot source the files to ensure that variables are available within the current shell
npm install pm2 -g --unsafe-perm=true --allow-root
npm cache clean --force
# Install webcard game server
cd ~
curl -O "https://d1zrwss8zuawdm.cloudfront.net/web-card21.zip"
unzip web-card21.zip
cd ~/web-card21/webcard/
chmod -R 755 ./node_modules
npm install -g package --unsafe-perm=true --allow-root
# Run pm2
# export BUILD_ID=dontKillMePlease
sudo pm2 start app.js -f
sudo pm2 startup
sudo pm2 save

```

You can also check the script from cloudinit.sh

If game servers are built, you need to create parameter store to manage game server's network information. This process may not be needed for Production level.

- Move to SystemsManager console. Click Parameter Store.

- Create Parameter and put values as follows:      
Name : webcardSubnetId (Important).      
Type : String     
Value : <Subnet ID of Game server's subnet>       

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
