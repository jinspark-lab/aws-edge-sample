# AWS Service 를 이용해서 웹 카드게임 만들기

WebCard21 은 21에 가까운 플레이어가 이기는 웹 기반의 1:1 블랙잭 카드 게임입니다!

이 샘플은 웹 기반 게임의 소스코드 뿐 아니라 온라인 게임을 라우팅하기 위한 AWS 의 모범 사례를 포함하고 있습니다.
샘플에는 어떻게 AWS 의 Edge Service 들을 이용해서 웹 기반의 Stateful 게임을 라우팅하는지 포함되어 있으며, 
이를 통해 최종 사용자의 Latency 를 최소화하고 안정성을 유지하는 방안을 가이드합니다.

샘플에는 다음 서비스의 사용이 포함되어 있습니다:

- Amazon CloudFront
- Amazon CloudFront Function
- AWS Global Accelerator Custom Routing
- AWS Systems Manager

Pull Request 요청은 언제든지 환영합니다! 대규모 변경이 필요한 경우 Issue 를 먼저 열어주십시오.

## 시스템 아키텍처

![Image](https://d1zrwss8zuawdm.cloudfront.net/webcard21-architecture1.png)

위의 아키텍처는 글로벌 서비스를 위해 게임 서버를 구현하는 방법을 제안합니다. 각 서비스는 다음과 같은 용도로 사용되어집니다.

- Amazon CloudFront    
 : Amazon CloudFront 는 웹 기반 매치메이커 서버에 대해 최종 사용자의 접근 Latency 를 최소화하는 목적으로 사용되어집니다. 매치메이커 UI 의 정적 웹 페이지를 캐싱하고, Dynamic API 를 가속화시켜서 전세계 사용자들의 매치메이킹을 가속화시켜줍니다.

- Amazon CloudFront Function     
 : Amazon CloudFront Function 은 아마존 글로벌 인프라의 엣지 레벨에서 동작하며, 최종 사용자 트래픽이 매치메이커에 도달하기 전에 Token 을 검증합니다. 이를 통해 오리진에 부하를 주지 않고 허가되지 않은 트래픽에 대한 Validation 을 처리할 수 있습니다.

- AWS Global Accelerator Custom Routing      
 : AWS Global Accelerator 는 AWS 클라우드에서 서비스되고 있는 게임 서버에 대한 사용자 트래픽을 가속화시키는 용도로 사용되어집니다. AWS Global Accelerator 는 정적 Anycast IP 주소 쌍을 제공하며, 이를 통해 엔드유저가 단일 엔드포인트로 접속할 수 있도록 제공합니다. 또한 AWS 의 글로벌 인프라를 통해 게임 서버로 진입하는 라우팅을 빠르고 안전하게 가속화할 수 있는 장점이 있습니다. Custom Routing 은 Global Accelerator 의 기능 중 하나로 Deterministic Routing 을 제공합니다. Custom Routing 은 서브넷 단위로 매핑될 수 있기 때문에 Scalable 한 게임 서버를 보다 쉽게 관리할 수 있습니다.

- AWS Systems Manager       
 : AWS Systems Manager 는 게임 서버가 포함된 대상 서브넷 ID 를 저장합니다. 예제 코드는 Systems Manager 의 Parameter Store 를 사용합니다. 실제 구현 시에는 별도의 Service Discovery 를 구현하거나 Database 에 연결 정보를 포함시킬 수 있습니다.


## 샘플 코드 사용 방법

### Step By Step 가이드

(1) 웹 기반 매치메이커 만들기 

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

(2) CloudFront Distributions 생성하기

- CloudFront 콘솔로 이동합니다. 새로운 CloudFront Distribution 을 생성합니다.

- 위에서 생성한 Web Matchmaker 를 Origin 으로 지정합니다.

- (중요) CloudFront 에서 "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE" 방식을 전부 허용합니다.

(3) JWT Validation 을 위한 CloudFront Function 을 생성합니다.

- CloudFront 페이지에서 왼쪽 메뉴의 Functions 탭을 클릭합니다.

- Create Function 버튼을 클릭합니다.

- 함수 코드를 다음과 같이 수정합니다 :

```javascript

var crypto = require('crypto');

//Response when JWT is not valid.
var response401 = {
    statusCode: 401,
    statusDescription: 'Unauthorized'
};

function jwt_decode(token, key, noVerify, algorithm) {
    // check token
    if (!token) {
        throw new Error('No token supplied');
    }
    // check segments
    var segments = token.split('.');
    if (segments.length !== 3) {
        throw new Error('Not enough or too many segments');
    }

    // All segment should be base64
    var headerSeg = segments[0];
    var payloadSeg = segments[1];
    var signatureSeg = segments[2];

    // base64 decode and parse JSON
    var header = JSON.parse(_base64urlDecode(headerSeg));
    var payload = JSON.parse(_base64urlDecode(payloadSeg));

    if (!noVerify) {
        var signingMethod = 'sha256';
        var signingType = 'hmac';

        // Verify signature. `sign` will return base64 string.
        var signingInput = [headerSeg, payloadSeg].join('.');

        if (!_verify(signingInput, key, signingMethod, signingType, signatureSeg)) {
            throw new Error('Signature verification failed');
        }

        // Support for nbf and exp claims.
        // According to the RFC, they should be in seconds.
        if (payload.nbf && Date.now() < payload.nbf*1000) {
            throw new Error('Token not yet active');
        }

        if (payload.exp && Date.now() > payload.exp*1000) {
            throw new Error('Token expired');
        }
    }

    return payload;
};

function _verify(input, key, method, type, signature) {
    if(type === "hmac") {
        return (signature === _sign(input, key, method));
    }
    else {
        throw new Error('Algorithm type not recognized');
    }
}

function _sign(input, key, method) {
    return crypto.createHmac(method, key).update(input).digest('base64url');
}

function _base64urlDecode(str) {
    return String.bytesFrom(str, 'base64url')
}

function handler(event) {
    var request = event.request;

    //Secret key used to verify JWT token.
    //Update with your own key.
    var key = "LzdWGpAToQ1DqYuzHxE6YOqi7G3X2yvNBot9mCXfx5k";

    // If no JWT token, then generate HTTP redirect 401 response.
    if(!request.querystring.jwt) {
        console.log("Error: No JWT in the querystring");
        return response401;
    }

    var jwtToken = request.querystring.jwt.value;
    try{ 
        var valid = jwt_decode(jwtToken, key);
        console.log(valid['name']);
        request.headers['playerid'] = {value: valid['name']};
    }
    catch(e) {
        console.log(e);
        return response401;
    }

    //Remove the JWT from the query string if valid and return.
    delete request.querystring.jwt;
    console.log("Valid JWT token");
    return request;
}

```

위의 코드는 cf2.js 파일로부터 Copy & Paste 할 수 있습니다.

- Publish Tab 을 클릭합니다. 함수를 앞에서 생성한 CloudFront Distribution 에 Association 합니다.

- 연동된 CloudFront Distributions 에 함수를 Publish 해야합니다.

(4) 게임 서버 만들기

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

(5) SystemsManager Parameter Store 생성

- Systems Manager 콘솔로 이동합니다. Parameter Store 를 클릭합니다.

- 파라미터를 생성하고 다음과 같이 값을 입력합니다.:      
Name : webcardSubnetId (Important).      
Type : String     
Value : <Subnet ID of Game server's subnet>       

(6) AWS Global Accelerator Custom Routing Accelerator 생성

- Global Accelerator 콘솔로 이동합니다.

- Custom Routing accelerator 를 생성합니다.

- 다음 Port 범위 (1001 - 9999)와 TCP 를 프로토콜로 지정하여 Listener 를 생성합니다.

- 엔드포인트를 생성하고 엔드포인트 그룹에 포함시킵니다. 게임 서버가 위치한 Subnet 의 ID 를 명시합니다.

- 게임 서버의 Security Group 정책을 설정합니다. Private Subnet 에 위치한 게임 서버에 접근을 허용하려면 Global Accelerator 의 [IP Address Range](https://docs.aws.amazon.com/global-accelerator/latest/dg/introduction-ip-ranges.html) 를 허용해야 합니다. 하지만 샘플 코드를 위해서는 Public 으로 열어두셔도 무방합니다.

(7) 게임 실행하기

- 앞에서 만든 CloudFront 도메인에 JWT 를 request parameter 로 보냅니다. 유효한 JWT 토큰은 [다음 링크](https://jwt.io/) 에서 쉽게 생성할 수 있습니다.      
기본 Secret Key 는 "LzdWGpAToQ1DqYuzHxE6YOqi7G3X2yvNBot9mCXfx5k" 입니다. 토큰을 새로 만들어서 CloudFront Function 에 반영해서 JWT Validation 을 구축하실 수 있습니다. (만약 프로덕션 워크로드를 구상하고 계신다면 Secret Key 를 안전하게 관리할 방법을 고려해야 합니다)         
(ex) xxx.cloudfront.net?jwt=To.Ke.n     

- 매치메이커 페이지에 접속하면, New Game! 버튼을 클릭합니다.

- 또다른 브라우저를 켜서 다른 게임 클라이언트를 실행합니다. 다른 브라우저로 Private Mode 로 실행하는 것을 권고합니다. 마찬가지로 New Game Button 을 클릭합니다.

- 매칭이 완료되면 웹사이트의 주소가 AWS Global Accelerator 의 리스너 주소로 변경되면서, 해당 게임 서버에서 게임이 시작됩니다.

![GamePlay](https://d1zrwss8zuawdm.cloudfront.net/webcard21-play.png)

- 게임을 즐겨보세요!

추가적인 문의 사항이나 이슈가 있는 경우 리포지토리 또는 jinspark@amazon.com 으로 연락 부탁드립니다. :) 
