+++
title= "Create CloudFront Distributions"
url= "/cloudfront"
pre= "<b>2. </b>"
weight= 30
chapter= false
+++

## Create CloudFront Distributions

![CloudFront](https://d1zrwss8zuawdm.cloudfront.net/webcard21-cf.png)

- Move to CloudFront Console. Create CloudFront Distribution.

- Designate Web Matchmaker as an Origin

- (Important) It is essential to allow "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE" method on CloudFront.

## Create CloudFront Functions for JWT validation

- From the CloudFront page, Click Functions tab on the left side.

- Click the button "Create Function"

- Edit the function code as follows:

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

You can also copy & paste the code from cf2.js.       

- Click Publish Tab. And Associate the CloudFront Distribution made above.

![CF2](https://d1zrwss8zuawdm.cloudfront.net/webcard21-cf2.png)

- Also you should Publish the function to the associated CloudFront Distributions.

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
