+++
title= "Monitoring Service"
url= "/monitor"
pre= "<b>6. </b>"
weight= 80
chapter= false
+++

## Service Monitoring based on CloudWatch RUM

- The best way to check end-user experiences is Read User Monitoring (RUM). You are able to evaluate real-user experiences and latency with the test.

- If you are using Amazon CloudWatch RUM, it is able to analyze end-user traffics inside the AWS Console Dashboard.

- Move to CloudWatch Console. (us-east-1)

- Click the RUM button from the Application Monitoring tab on the left side.

- Click the buttonAdd App Monitor, and start App Monitoring.

- In this sample, we are going to integrate CloudWatch RUM into Matchmaker. Input App Monitor Name and Application Domain as follows:

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-appmonitor.png)

- You should input Top Level Domain(TLD) into Application Domain. Please check whether domain is correct.

- Collect Performance metrics, Javascript errors and so on.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-metric.png)

- CloudWatch RUM manages User Sessions using Amazon Cognito. Create new Identity Pool as follows:

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-cognito.png)

- Click the button Add App Monitor, and create App Monitor.

- Copy Javascript Snippets from the console, and paste on our source code(/webcardmatch/views/index.html). You should put it inside <head></head> tag. This should be the upper most <script></script> tag in the source code.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-snippet.png)

- Redeploy the index.html source code on the Matchmaker EC2 instance.

- Restart the game match. Now we are able to monitor the application using CloudWatch RUM.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-rum1.png)

- It is able to monitor real-user performance and end-user session information.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-rum2.png)

- In this sample, I set CloudWatch RUM into matchmaker, but you are able to set it for application server side.

If you have any queries & issues, please feel free to contact me through this repository or email(jinspark@amazon.com). :) 

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
