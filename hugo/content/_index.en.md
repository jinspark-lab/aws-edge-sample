+++
date = 2022-01-06
title = "Edge Service HoL"
weight = 10
chapter = false
+++

# Building Global WebCard game based on AWS

WebCard is an Web-based 1:1 BlackJack game. 
You are able to launch this game globally, and play card games with global players.
Have Fun!

Not only source codes for the web-based game, but it also includes AWS best practices to implement online game routing features.

This sample includes how to use AWS Edge services for routing web-based persistent games.
Using Edge services helps you to minimize end-user latency for your game service.

It includes as follows:       

#### [Amazon CloudFront](https://aws.amazon.com/cloudfront)
#### [Amazon CloudFront Function](https://aws.amazon.com/blogs/aws/introducing-cloudfront-functions-run-your-code-at-the-edge-with-low-latency-at-any-scale/)
#### [AWS Global Accelerator Custom Routing](https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-aws-global-accelerator-custom-routing-accelerators/)
#### [AWS Systems Manager](https://aws.amazon.com/systems-manager)
#### [Amazon CloudWatch RUM](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM.html)

Pull requests are always welcome. For major changes, please open an issue first to discuss what you would like to change.

## Architecture

![Image](https://d1zrwss8zuawdm.cloudfront.net/webcard21-architecture2.png)


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

- Amazon CloudWatch RUM
 : Amazon CloudWatch RUM is used for measuring end-user experiences for the application. You are able to evaluate end-user performance & errors & session information inside AWS Console Dashboard. You are also integrating AWS X-Ray, Amazon Cognito and Amazon CloudWatch Logs to analyze.


## How to Use

Step-by-Step guidance is provided. For the additional support, please feel free to contact through the Repository or email(jinspark@amazon.com). :) 


<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
