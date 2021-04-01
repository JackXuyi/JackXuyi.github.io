---
title: nodejs中实现websocket服务
date: 2021-01-05 22:57:14
tags: [node, 计算机网络, JavaScript]
---

### 建立链接

若要实现 WebSocket 协议，首先需要浏览器主动发起一个 HTTP 请求。

这个请求头包含“Upgrade”字段，内容为“websocket”（注：upgrade 字段用于改变 HTTP 协议版本或换用其他协议，这里显然是换用了 websocket 协议），还有一个最重要的字段“Sec-WebSocket-Key”，这是一个随机的经过 base64 编码的字符串，像密钥一样用于服务器和客户端的握手过程。一旦服务器君接收到来自客户端的 upgrade 请求，便会将请求头中的“Sec-WebSocket-Key”字段提取出来，追加一个固定的“魔串”：`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`，并进行 SHA-1 加密，然后再次经过 base64 编码生成一个新的 key，作为响应头中的“Sec-WebSocket-Accept”字段的内容返回给浏览器。一旦浏览器接收到来自服务器的响应，便会解析响应中的“Sec-WebSocket-Accept”字段，与自己加密编码后的串进行匹配，一旦匹配成功，便有建立连接的可能了（因为还依赖许多其他因素）。

这是一个基本的 Client 请求头：

```yml
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: ************==
Sec-WebSocket-Version: **
```

Server 正确接收后，会返回一个响应头：

```yml
Upgrade：websocket
Connnection: Upgrade
Sec-WebSocket-Accept: ******************
```

这表示双方握手成功了，之后就是全双工的通信。

#### js 代码实现

```js
// 构建响应头
function buildHeaders(secWebsocketKey) {
  // 计算返回的key
  const resKey = crypto
    .createHash('sha1')
    .update(secWebsocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64')

  // 构造响应头
  return [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-WebSocket-Accept: ' + resKey,
  ]
    .concat('', '')
    .join('\r\n')
}
```

### 解析数据

#### Frame（帧）

WebSocket 传输的数据都是以 Frame（帧）的形式实现的，就像 TCP/UDP 协议中的报文段 Segment。下面就是一个 Frame：（以 bit 为单位表示）

```js
/**
 * 
  1               2               3               4
  0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
 */
```

##### 按照 RFC 中的描述：

- FIN： 1 bit， 0 表示还有后续帧，1 表示最后一帧
- RSV1、2、3： 没个 1 bit，除非一个扩展经过协商赋予了非零值以某种含义，否则必须为 0，如果没有定义非零值，并且收到了非零的 RSV，则 websocket 链接会失败
- Opcode： 4 bit，如果收到了未知的 opcode，最后会断开链接, 这四位的值组合结果的含义分别如下：

```yml
    0x0 : 代表连续的帧
    0x1 : text帧
    0x2 ： binary帧
    0x3-0x7 ： 为非控制帧而预留的
    0x8 ： 关闭握手帧
    0x9 ： ping帧
    0xA : pong 帧
    0xB-0xF ： 为非控制帧而预留的
```

- Mask： 1 bit，0 表示数据没有添加掩码，1 表示数据被添加了掩码，如果置 1， “Masking-key”就会被赋值，所有从客户端发往服务器的帧都会被置 1
- Payload length： 7 bit | 7+16 bit | 7+64 bit，“payload data” 的长度如果在 0~125 bytes 范围内，它就是“payload length”，如果是 126 bytes， 紧随其后的被表示为 16 bits 的 2 bytes 无符号整型就是“payload length”，如果是 127 bytes， 紧随其后的被表示为 64 bits 的 8 bytes 无符号整型就是“payload length”
- Masking-key： 0 or 4 bytes，所有从客户端发送到服务器的帧都包含一个 32 bits 的掩码（如果“mask bit”被设置成 1），否则为 0 bit。一旦掩码被设置，所有接收到的 payload data 都必须与该值以一种算法做异或运算来获取真实值。
- Payload data: n bytes，数据内容

#### 读取数据帧

```js
class CustomReadSocket extends EventEmitter {
  static MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

  constructor(req, socket, head) {
    super()
    // 保存上下文信息
    this.req = req
    this.socket = socket
    this.head = head

    // 内部状态
    this.dataType = ''
    this.resHeaders = this.buildHeaders(req.headers['sec-websocket-key'])
    this.buffer = null

    // 接收数据
    this.socket.on('data', this.handleData)

    // 响应给客户端
    this.socket.write(this.resHeaders)
  }

  // 构建响应头
  buildHeaders(secWebsocketKey) {
    // 计算返回的key
    const resKey = crypto
      .createHash('sha1')
      .update(secWebsocketKey + CustomReadSocket.MAGIC_STRING)
      .digest('base64')

    // 构造响应头
    return [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      'Sec-WebSocket-Accept: ' + resKey,
    ]
      .concat('', '')
      .join('\r\n')
  }

  // 处理收到的数据
  handleData = (data) => {
    do {
      const type = this.getFrameType(data[0])
      if (type && type !== 'continue') {
        this.dataType = type
      }
      if (type === 'continue' || type === 'text' || type === 'binary') {
        let maskLen = 0
        if (this.hasMask(data[1])) {
          maskLen = 4
        }
        const [start, len] = this.getFrameDataLength(data)

        this.getDataFromFrame(
          data.slice(start + maskLen),
          data.slice(start, start + maskLen),
        )
      }
    } while (!this.isLastFrame(data[0]))
    this.handleAllType(this.dataType)
  }

  // 获取当前帧类型
  getFrameType(byte) {
    const realType = byte & 0x7f
    if (!realType) {
      // 代表连续的帧
      return 'continue'
    } else if (realType === 0x01) {
      return 'text'
    } else if (realType === 0x09) {
      return 'ping'
    } else if (realType === 0x0a) {
      return 'pong'
    } else if (realType === 0x02) {
      return 'binary'
    } else if (realType === 0x08) {
      return 'close'
    } else {
      return ''
    }
  }

  // 处理所有帧类型
  handleAllType(type) {
    switch (type) {
      case 'continue': {
        console.log('continue')
        break
      }
      case 'text': {
        this.emit('message', this.buffer.toString())
        break
      }
      case 'binary': {
        this.emit('message', this.buffer)
        break
      }
      case 'close': {
        this.emit('close')
        break
      }
      case 'ping': {
        this.emit('ping')
        break
      }
      case 'pong': {
        this.emit('pong')
        break
      }
      default: {
        console.log('others')
      }
    }
    // 释放 buffer 和重置数据类型
    this.buffer = null
    this.dataType = ''
  }

  // 判断是否是最后一个帧
  isLastFrame(byte) {
    return !!(byte & 0x80)
  }

  // 提取帧的长度
  getFrameDataLength(buffer) {
    // 第二个字节的底 7 位
    const firtLen = buffer[1] & 0x7f
    if (firtLen < 125) {
      return [2, firtLen]
    } else if (firtLen === 126) {
      const len = buffer.readUInt16BE(2)
      return [4, len]
    } else {
      const len = buffer.readUInt64BE(2)
      return [10, len]
    }
  }

  // 判断是否有掩码
  hasMask(byte) {
    return !!(0x80 & byte)
  }

  // 从帧里提取数据
  getDataFromFrame(buffer, maskBuffer) {
    if (buffer && buffer.length) {
      const len = buffer.length
      if (maskBuffer && maskBuffer.length === 4) {
        for (let i = 0; i < len; i++) {
          buffer[i] = buffer[i] ^ maskBuffer[i % 4]
        }
      }
      this.buffer = this.buffer ? Buffer.concat([this.buffer, buffer]) : buffer
    }
  }
}
```

#### 写入数据帧

```js
class CustomWebsocket extends CustomReadSocket {
  timer = null
  constructor(req, socket, head, options) {
    super(req, socket, head)
    this.options = options

    this.timeout()
    this.socket.on('data', () => {
      this.timeout()
    })
  }

  send(message) {
    const buffer = Buffer.from(message)
    const list = this.buildDataFrameList('text', buffer)
    list.forEach((frame) => {
      this.socket.write(frame)
    })
    this.timeout()
  }

  ping() {
    const frame = this.buildFrame('ping')
    this.socket.write(frame)
    this.timeout()
  }

  pong() {
    const frame = this.buildFrame('pong')
    this.socket.write(frame)
    this.timeout()
  }

  close() {
    const frame = this.buildFrame('close')
    this.socket.write(frame)
    this.socket.end()
    process.nextTick(() => {
      this.socket.destroy()
    })
  }

  timeout() {
    const { timeout = 10000 } = this.options || {}
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.ping()
    }, timeout)
  }

  buildDataFrameList(type, buffer) {
    const bufferList = []
    let tempBuffer = buffer
    while (tempBuffer.length) {
      bufferList.push(tempBuffer.slice(0, this.MAX_FRAME_SIZE))
      tempBuffer = tempBuffer.slice(this.MAX_FRAME_SIZE)
    }
    const len = bufferList.length
    return bufferList.map((buf, index) =>
      this.buildFrame(index ? 'continue' : type, len === index + 1, buf),
    )
  }

  buildFrame(dataType, isLast = true, buffer = null) {
    let firstByte = isLast ? 0x80 : 0x00
    switch (`${dataType || ''}`.toLowerCase()) {
      case 'continue': {
        firstByte = firstByte | 0x00
        break
      }
      case 'text': {
        firstByte = firstByte | 0x01
        break
      }
      case 'binary': {
        firstByte = firstByte | 0x02
        break
      }
      case 'close': {
        firstByte = firstByte | 0x08
        break
      }
      case 'ping': {
        firstByte = firstByte | 0x09
        break
      }
      case 'pong': {
        firstByte = firstByte | 0x0a
        break
      }
      default: {
        console.log('others')
      }
    }
    let secondByte = 0x00

    if (buffer && buffer.length) {
      const lenByteList = []
      const len = buffer.length
      if (len <= 125) {
        secondByte = secondByte | len
      } else if (len >= 126 && len < 65536) {
        secondByte = secondByte | 0x7e
        for (let i = 0; i < 2; i++) {
          lenByteList.push(0xff & (len >> (i * 8)))
        }
      } else {
        secondByte = secondByte | 0x7f
        for (let i = 0; i < 8; i++) {
          lenByteList.push(0xff & (len >> (i * 8)))
        }
      }
      lenByteList.reverse()
      const prefixBuffer = Buffer.from([firstByte, secondByte, ...lenByteList])
      return Buffer.concat([prefixBuffer, buffer])
    }
    return Buffer.from([firstByte, secondByte])
  }
}
```

### 参考

- [学习 WebSocket 协议—从顶层到底层的实现原理（修订版）
  ](https://github.com/abbshr/abbshr.github.io/issues/22)
- [Node.js - 200 多行代码实现 Websocket 协议](https://segmentfault.com/a/1190000016467409)
- [WebSocket：5 分钟从入门到精通](https://segmentfault.com/a/1190000012709475)
- [编写 WebSocket 服务器](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
- [本文涉及到的页面源代码](https://github.com/JackXuyi/web-exercise/blob/master/handwriting/socketServer.js)
