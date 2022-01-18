+++
date = 2022-01-06
title = "Edge Service HoL"
weight = 10
chapter = false
+++

# AWS Edge Service 를 이용해서 글로벌 웹게임 만들기

WebCard 은 21에 가까운 플레이어가 이기는 웹 기반의 1:1 블랙잭 카드 게임입니다!
우리는 이 카드게임을 글로벌 서비스로 확장해서, 전세계 플레이어들과 카드게임을 즐길 예정입니다.

이 샘플은 웹 기반 게임의 소스코드 뿐 아니라 온라인 게임을 라우팅하기 위한 AWS 의 모범 사례를 포함하고 있습니다.
샘플에는 어떻게 AWS 의 Edge Service 들을 이용해서 웹 기반의 Stateful 게임을 라우팅하는지 포함되어 있으며, 
이를 통해 최종 사용자의 Latency 를 최소화하고 안정성을 유지하는 방안을 가이드합니다.

샘플에는 다음 서비스의 사용이 포함되어 있습니다:       

#### [Amazon CloudFront](https://aws.amazon.com/cloudfront)
#### [Amazon CloudFront Function](https://aws.amazon.com/blogs/aws/introducing-cloudfront-functions-run-your-code-at-the-edge-with-low-latency-at-any-scale/)
#### [AWS Global Accelerator Custom Routing](https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-aws-global-accelerator-custom-routing-accelerators/)
#### [AWS Systems Manager](https://aws.amazon.com/systems-manager)
#### [Amazon CloudWatch RUM](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM.html)

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

- Amazon CloudWatch RUM
 : Amazon CloudWatch RUM 은 실제 사용자의 Latency 및 사용자 경험을 측정하기 위한 방법입니다. 자바스크립트 스니펫을 삽입하는 것만으로 실제 엔드유저의 사용자 경험, 세션 정보 등 다양한 어플리케이션 정보를 쉽게 모니터링할 수 있습니다.

## 샘플 코드 사용 방법

과정에 대한 가이드는 Step by Step 으로 이루어져있습니다.

추가적인 문의 사항이나 이슈가 있는 경우 Repository 또는 jinspark@amazon.com 으로 연락 부탁드립니다. :) 


<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
