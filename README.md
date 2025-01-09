# Apixis Dashboard Unofficial

[Preview](https://apisix-dashboard.lensual.space/)

纯前端应用 无后端

## Quick Start

TODO

先直接用 [Preview](https://apisix-dashboard.lensual.space/) 吧

## FAQ

登录时控制台报错`Mixed Content: The page at 'xxx' was loaded over HTTPS, but requested an insecure script 'xxx'. This request has been blocked; the content must be served over HTTPS.`

Apisix Admin API 是 http 的，当前页面是 https，浏览器安全策略不允许混合内容。用其他工具映射 Apisix 端口到本地，例如 `127.0.0.1:9180 -> 192.168.233.11:9180`，然后地址使用 `http://127.0.0.1:9180` 即可。
