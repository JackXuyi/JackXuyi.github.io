---
title: js基础知识系列（三）
date: 2019-08-11 23:26:15
tags: javascript
---

# DOM中监听节点变化的事件（高级程序设计第13.4.6节）

DOM2级的変动事件是为XML或html的DOM设计的，不特定于某种语言。

## 变动事件的分类有7种

1. `DOMSubtreeModified`：在DOM结构中发生任何变化时触发
2. `DOMNodeInserted`：在一个节点作为子节点被插入到另一个节点中时触发
3. `DOMNodeRemoved`：在节点从其父节点中被移除时触发
4. `DOMNodeInsertedIntoDocument`：在一个节点被直接插入文档中或者通过子树间接插入文档后触发。在DOMNodeInserted之后触发
5. `DOMNodeRemovedFromDocument`：在一个节点被直接从文档中删除或通过子树间接从文档中移除之前触发。在DOMNodeRemoved之后触发
6. `DOMAttrModified`：在特性被修改之后触发
7. `DOMCharacterDataModified`：在文本节点的值发生变化的时候触发

## 常用的浏览器支持的有3种

1. `DOMSubtreeModified`：在DOM结构中发生任何变化时触发
2. `DOMNodeInserted`：在一个节点作为子节点被插入到另一个节点中时触发
3. `DOMNodeRemoved`：在节点从其父节点中被移除时触发

## 应用

页面中嵌套有`iframe`且需要父页面自适应`iframe`高度时可以通过监听`iframe`的`DOM`变化来实现
