+++
title= "Play the Game"
url= "/gameplay"
pre= "<b>5. </b>"
weight= 70
chapter= false
+++

## Game Play

- Access to the CloudFront domain with JWT. You can make proper token from [JWT.IO](https://jwt.io/)
Default Secret Key is "LzdWGpAToQ1DqYuzHxE6YOqi7G3X2yvNBot9mCXfx5k". You can create your own token from it. If you use your own secret key, you should fix the code inside of CloudFront Function. (If you are preparing production workload, please consider how to manage Secret Key securely)        
(ex) xxx.cloudfront.net?jwt=To.Ke.n

- When you access to the matchmaker, Click the "New Game!" Button.

- Open another game client from the browser. Recommend to use another browser in private mode. Click the New Game Button

- After matching is completed, the game will soon be started on the Game Server through AWS Global Accelerator.

![GamePlay](https://d1zrwss8zuawdm.cloudfront.net/webcard21-play.png)

- Have fun!

If you have any queries & issues, please feel free to contact me through this repository or email(jinspark@amazon.com). :) 

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
