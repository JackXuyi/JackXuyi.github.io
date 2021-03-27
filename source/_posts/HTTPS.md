---
title: HTTPS
date: 2021-03-27 20:13:54
tags: 计算机网络
---

`HTTPS` 协议是通过加入 `SSL` 层来加密 `HTTP` 数据进行安全通信的

### `HTTPS` 建立链接的过程

1. 客户端发起请求，携带客户端支持加密算法，同时携带随机串 1
2. 服务端收到请求后与自己支持的加密算法进行比对，从双方都支持的加密算法中选择一个返回，同时返回域名相关的公钥和证书签名信息（包括证书时间、日期、颁发机构）及随机串 2
3. 客户端收到响应后验证证书的合法性和公钥的正确性（通过请求证书颁发机构来验证证书的合法性）
4. 证书验证通过后，利用公钥加密一个随机字符串作为后续传输数据的密钥，同时加入利用公钥加密随机串 1 和随机串 2 组成的握手信息，然后发送给服务端
5. 服务端获取到信息后利用私钥进行解密得到客户端生成的随机字符串把它作为后续传输的密钥，利用密钥对传输的随机串 1 和随机串 2 进行加密，然后返回
6. 客户端利用上述生成的随机串对返回的信息进行解密，然后验证其合法性，后续传输就是堆成加密传输

![HTTPS 获取密钥过程](/images/HTTPS.png)

### 参考文档

- [https 建立连接过程](https://www.jianshu.com/p/33d0f8631f90)
- [HTTP 和 HTTPS 协议，看一篇就够了
  ](https://blog.csdn.net/xiaoming100001/article/details/81109617)