+++
title = "Global Accelerator 구성하기"
url= "/globalaccelerator"
pre= "<b>4. </b>"
weight= 60
chapter= false
+++

## AWS Global Accelerator Custom Routing Accelerator 생성

- Global Accelerator 콘솔로 이동합니다.

- Custom Routing accelerator 를 생성합니다.

- 다음 Port 범위 (1001 - 9999)와 TCP 를 프로토콜로 지정하여 Listener 를 생성합니다.

![AGA](https://d1zrwss8zuawdm.cloudfront.net/webcard21-aga.png)

- 엔드포인트를 생성하고 엔드포인트 그룹에 포함시킵니다. 게임 서버가 위치한 Subnet 의 ID 를 명시합니다.

- 게임 서버의 Security Group 정책을 설정합니다. Private Subnet 에 위치한 게임 서버에 접근을 허용하려면 Global Accelerator 의 [IP Address Range](https://docs.aws.amazon.com/global-accelerator/latest/dg/introduction-ip-ranges.html) 를 허용해야 합니다. 하지만 샘플 코드를 위해서는 Public 으로 열어두셔도 무방합니다.

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
