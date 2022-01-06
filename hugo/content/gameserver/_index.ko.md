+++
title= "Game Server 구축하기"
url= "/gameserver"
pre= "<b>3. </b>"
weight= 40
chapter= false
+++

## 게임 서버 구축하기

- VPC 콘솔로 이동합니다. VPC 내에 Private Subnet 을 생성합니다.

- EC2 콘솔로 이동합니다. Launch Instance 버튼을 클릭합니다.

- Amazon Linux2 AMI 를 선택합니다.

- 아무 인스턴스 타입을 선택하고 Next 버튼을 클릭합니다.

- Private Subnet 에 EC2 인스턴스를 생성합니다. 이 Private Subnet 은 매치메이커의 서브넷과 다른 서브넷에 위치할 수 있습니다.

- 인스턴스 세부 정보를 설정합니다. 다음 Shell Script 를 사용자 데이터(User Data)에 포함시킵니다.

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

위의 스크립트는 cloudinit.sh 에서도 참고하실 수 있습니다.

게임 서버가 생성되었으면, 게임 서버의 네트워크 정보를 관리할 수 있게 등록해줍니다. 이 과정은 Service Level 에서는 필요하지 않을 수 있습니다.

- Systems Manager 콘솔로 이동합니다. Parameter Store 를 클릭합니다.

- 파라미터를 생성하고 다음과 같이 값을 입력합니다.:      
Name : webcardSubnetId (Important).      
Type : String     
Value : <Subnet ID of Game server's subnet>       

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
