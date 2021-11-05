#! /bin/sh

sudo yum update -y
sudo yum install ruby -y
sudo yum install wget
cd ~
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. $HOME/.nvm/nvm.sh
nvm install node
export NVM_DIR="/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
chmod -R 755 ./node_modules
npm install pm2 -g --unsafe-perm=true --allow-root
npm cache clean --force
npm install -g package --unsafe-perm=true --allow-root
pm2 stop all
export BUILD_ID=dontKillMePlease
pm2 restart ./app.js -f
