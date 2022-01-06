+++
title = "웹 기반 매치메이커"
url = "/matchmaker"
pre = "<b>1. </b>"
weight = 20
chapter = false
+++

## Web 기반의 Matchmaker 만들기

- EC2 콘솔로 이동합니다. Launch Instance 버튼을 클릭합니다.

- Amazon Linux2 AMI 를 선택합니다.

- 아무 인스턴스 타입을 선택하고 Next 버튼을 누릅니다.

- EC2 인스턴스를 Public Subnet 에 생성합니다.

- 인스턴스 세부 정보에 대한 설정 시 다음 쉘 스크립트를 사용자 데이터(User Data)에 추가합니다.


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

위의 스크립트는 소스 코드 내에 cloudinit.sh 에서도 참고하실 수 있습니다.

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
