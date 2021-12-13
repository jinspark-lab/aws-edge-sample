# WebCard21 

WebCard21 is an Web-based 1:1 BlackJack game. Have Fun!

Not only source codes for the web-based game, but it also includes AWS best practices to implement online game routing features.

This sample includes how to use AWS Edge services for routing web-based persistent games.
Using Edge services helps you to minimize end-user latency for your game service.

It includes as follows:

- Amazon CloudFront
- Amazon CloudFront Function
- AWS Global Accelerator Custom Routing
- AWS Systems Manager

Pull requests are always welcome. For major changes, please open an issue first to discuss what you would like to change.

## Architecture

![Image](https://d1zrwss8zuawdm.cloudfront.net/webcard21-architecture.png)

This architecture shows how to implement game servers for Global Service.

- Amazon CloudFront    
 : This helps minimizing end-users accessing latency for your web-based matchmaker.
It caches matchmaking web-pages and accelerates dynamic API for optimized web-based matchmaking.

- Amazon CloudFront Function     
 : In front of Amazon CloudFront, CloudFront Function(CFF) validates end-user's Token before it hits the matchmaker behind. As CFF works at the edge side of Amazon Global Infrastructure, it prevents unverified requests hit matchmaker instances.

- AWS Global Accelerator Custom Routing      
 : AWS Global Accelerator accelerates user traffics to Game Servers on AWS Cloud. It provides Anycast Static IP address pairs for end-users and helps their traffic routing to game servers fastly and consistently. Custom Routing is one of Global Accelerator's features makes deterministic routing for customers. Due to subnet mapping, it is easy to manage scalable game servers behind AWS Global Accelerator.

- AWS Systems Manager       
 : AWS Systems Manager is used for providing target subnet id to Matchmaker. Sample code uses Systems Manager - Parameter Stores, but it is also able to use Database to manage connection information.


## How to Use

### Step By Step Guidance

(1) Create Web-based Matchmaker 

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

(2) Create CloudFront Distributions

- Move to CloudFront Console. Create CloudFront Distribution.

- Designate Web Matchmaker as an Origin

- (Important) It is essential to allow "GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE" method on CloudFront.

(3) Create CloudFront Functions for JWT validation

- From the CloudFront page, Click Functions on the left side.

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

- Also you should Publish the function to the associated CloudFront Distributions.

(4) Create Game Server

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


(5) Create SystemsManager Parameter Store

- Move to SystemsManager console. Click Parameter Store.

- Create Parameter and put values as follows:      
Name : webcardSubnetId (Important).      
Type : String     
Value : <Subnet ID of Game server's subnet>       

(6) Create AWS Global Accelerator Custom Routing accelerator

- Move to Global Accelerator console.

- Create Custom Routing accelerator. 

- Add Listener with Port range (1001 - 9999) and TCP port.

- Add Endpoint to the Endpoint Group. Specify subnet id of game servers'.

- Open Game server's security group policy. You should check Global Accelerator IP Range from [this Document](https://docs.aws.amazon.com/global-accelerator/latest/dg/introduction-ip-ranges.html). But you can open the subnet publicly for the sample.

(7) Run your game

- Access to the CloudFront domain with JWT. You can make proper token from [JWT.IO](https://jwt.io/)
Default Secret Key is "LzdWGpAToQ1DqYuzHxE6YOqi7G3X2yvNBot9mCXfx5k". You can create your own token from it. (If you are preparing production workload, please consider how to manage Secret Key securely)

- When you access to the matchmaker, Click the "New Game!" Button.

- Open another game client from the browser. Recommend to use another browser in private mode. Click the New Game Button

- After matching is completed, the game will soon be started on the Game Server through AWS Global Accelerator.

![GamePlay](https://d1zrwss8zuawdm.cloudfront.net/webcard21-play.png)

- Have fun!

If you have any queries & issues, please feel free to contact me. :) 
