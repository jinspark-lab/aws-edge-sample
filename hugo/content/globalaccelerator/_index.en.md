+++
title= "Global Accelerator Custom Routing"
url= "/globalaccelerator"
pre= "<b>4. </b>"
weight= 60
chapter= false
+++

## Create AWS Global Accelerator Custom Routing accelerator

- Move to Global Accelerator console.

- Create Custom Routing accelerator. 

- Add Listener with Port range (1001 - 9999) and TCP port.

![AGA](https://d1zrwss8zuawdm.cloudfront.net/webcard21-aga.png)

- Add Endpoint to the Endpoint Group. Specify subnet id of game servers'.

- Open Game server's security group policy. You should check Global Accelerator IP Range from [this Document](https://docs.aws.amazon.com/global-accelerator/latest/dg/introduction-ip-ranges.html). But you can open the subnet publicly for the sample.

<p align="center">
© 2022 Amazon Web Services, Inc. 또는 자회사, All rights reserved.
</p>
