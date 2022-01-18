+++
title= "서비스 모니터링하기"
url= "/monitor"
pre= "<b>6. </b>"
weight= 80
chapter= false
+++

## CloudWatch RUM 기반의 서비스 모니터링

- 어플리케이션의 사용자 반응성을 체크하는 가장 좋은 방식은 Real User Monitoring 기법으로, 실제 사용자 레벨에서의 사용자 경험 및 Latency 를 체크하는 것입니다.  

- Amazon CloudWatch RUM 을 이용하면, 실제 사용자 트래픽을 대시보드를 통해 쉽게 모니터링할 수가 있습니다.

- CloudWatch 콘솔로 이동합니다. (us-east-1)

- 좌측의 Application Monitoring 탭에서 RUM 을 클릭합니다. 

- Add App Monitor 버튼을 클릭해서 새로운 모니터링 어플리케이션을 시작합니다.

- 다음과 같이 App Monitor Name 과 Application Domain 을 입력합니다. 샘플에서는 매치메이커에서 사용자 트래픽 모니터링을 하기 위해 CloudWatch RUM 을 연동합니다.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-appmonitor.png)

- Application Domain 에는 TLD (Top Level Domain) 를 입력해야 합니다. 도메인이 알맞게 입력되었는지 확인합니다.

- 성능, Javascript 에러 등 모든 지표를 수집하도록 합니다.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-metric.png)

- CloudWatch RUM 은 Amazon Cognito 서비스를 이용해서 사용자 세션을 관리합니다. 새로운 Identity Pool 을 생성하고 사용하게 합니다.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-cognito.png)

- Add App Monitor 버튼을 클릭해서 어플리케이션을 생성합니다.

- Javascript 스니펫을 복사해서 코드에 붙여넣습니다. 다음과 같이 /webcardmatch/views/index.html 의 <Head> 태그 안에서 가장 상위 <script></script> 태그로 입력해줍니다.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-snippet.png)

- 변경된 index.html 코드를 Matchmaker EC2 에 재배포합니다.

- 다시 게임 매치를 시작합니다. 이제 CloudWatch RUM 에 당신의 게임을 플레이하기 위한 유저들의 세션 정보를 모니터링할 수 있습니다.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-rum1.png)

- 실제 유저가 체감할 수 있는 성능정보 뿐 아니라 엔드 유저 디바이스 정보 등 다양한 지표들을 확인할 수 있습니다.

![RUM](https://d1zrwss8zuawdm.cloudfront.net/webcard21-rum2.png)

- 예제에서는 CloudWatch RUM 을 매치메이커에 두었지만, 어플리케이션 서버에 직접 둘 수도 있습니다. 다양하게 응용해서 어플리케이션 운영의 가시성을 높일 수 있습니다.

추가적인 문의 사항이나 이슈가 있는 경우 리포지토리 또는 jinspark@amazon.com 으로 연락 부탁드립니다. :) 

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
