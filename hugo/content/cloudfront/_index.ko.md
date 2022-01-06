+++
title= "CloudFront 연동하기"
url= "/cloudfront"
pre= "<b>2. </b>"
weight= 30
chapter= false
+++

## CloudFront Distributions 생성하기

![CloudFront](https://d1zrwss8zuawdm.cloudfront.net/webcard21-cf.png)

- CloudFront 콘솔로 이동합니다. 새로운 CloudFront Distribution 을 생성합니다.

- 위에서 생성한 Web Matchmaker 를 Origin 으로 지정합니다.

- (중요) CloudFront 에서 "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE" 방식을 전부 허용합니다.

## JWT Validation 을 위한 CloudFront Function 을 생성하기

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

![CF2](https://d1zrwss8zuawdm.cloudfront.net/webcard21-cf2.png)

- 연동된 CloudFront Distributions 에 함수를 Publish 해야합니다.

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
