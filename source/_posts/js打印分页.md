---
title: js打印分页
date: 2023-10-14 18:14:38
tags: [JavaScript]
---

## 打印

调用 `window.print()` 进行页面打印

### 分页

`page-break-after` CSS 属性调整当前元素之后的分页符。

- auto:初始值。自动分页符（既不强制也不禁止）。
- always: 始终在元素后强制分页。
- avoid: 避免在元素后出现分页符。
- left: 在元素之后足够的分页符，一直到一张空白的左页为止。
- right: 在元素之后足够的分页符，一直到一张空白的右页为止。

`page-break-before` CSS 属性调整当前元素之后的分页符。

- auto:初始值。自动分页符（既不强制也不禁止）。
- avoid: 避免在元素前出现分页符。

`page-break-inside` CSS 属性调整当前元素之后的分页符。

- auto:初始值。自动分页符（既不强制也不禁止）。
- avoid: 避免在元素中出现分页符。

#### 备注

若遇到在某些浏览器设置 `page-break-after:always;` 无法生效时，可以参考以下配置

```html
<div style="display: block;position: relative;">
  <div
    style="page-break-after:always;page-break-inside: avoid;-webkit-region-break-inside: avoid;"
  >
    第一页
  </div>
  <div
    style="page-break-after:always;page-break-inside: avoid;-webkit-region-break-inside: avoid;"
  >
    第二页
  </div>
</div>
```

## 参考

- [print() 方法](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/print)
- [page-break-after: always; 不生效](https://stackoverflow.com/questions/1630819/google-chrome-printing-page-breaks)
- [page-break-after](https://developer.mozilla.org/zh-CN/docs/Web/CSS/page-break-after)
