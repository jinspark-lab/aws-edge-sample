+++
title= "게임 실행하기"
url= "/gameplay"
pre= "<b>5. </b>"
weight= 70
chapter= false
+++

## 게임 플레이

- 앞에서 만든 CloudFront 도메인에 JWT 를 request parameter 로 보냅니다. 유효한 JWT 토큰은 [다음 링크](https://jwt.io/) 에서 쉽게 생성할 수 있습니다.      
기본 Secret Key 는 "LzdWGpAToQ1DqYuzHxE6YOqi7G3X2yvNBot9mCXfx5k" 입니다. 토큰을 새로 만들어서 CloudFront Function 에 반영해서 JWT Validation 을 구축하실 수 있습니다. (만약 프로덕션 워크로드를 구상하고 계신다면 Secret Key 를 안전하게 관리할 방법을 고려해야 합니다)         
(ex) xxx.cloudfront.net?jwt=To.Ke.n     

- 매치메이커 페이지에 접속하면, New Game! 버튼을 클릭합니다.

- 또다른 브라우저를 켜서 다른 게임 클라이언트를 실행합니다. 다른 브라우저로 Private Mode 로 실행하는 것을 권고합니다. 마찬가지로 New Game Button 을 클릭합니다.

- 매칭이 완료되면 웹사이트의 주소가 AWS Global Accelerator 의 리스너 주소로 변경되면서, 해당 게임 서버에서 게임이 시작됩니다.

![GamePlay](https://d1zrwss8zuawdm.cloudfront.net/webcard21-play.png)

- 게임을 즐겨보세요!

추가적인 문의 사항이나 이슈가 있는 경우 리포지토리 또는 jinspark@amazon.com 으로 연락 부탁드립니다. :) 

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
