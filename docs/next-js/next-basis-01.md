---
title: "Next系列 (一): 什麼是CSR, SSR, SSG, ISR"
date: 2022-10-07 10:23:58
tags: [next-js, react, framework]
toc: true
draft: true
---

## CSR

React 讓我們可以打造複雜互動性的網頁應用，但是都是在專案目錄提供一個 `index.html` 並置入空 `div`，讓 react 能夠把完整的 DOM 「注入」進去，亦即後續的渲染都是交由 Client 端的瀏覽器了，所以也稱為 Client Side Rendering

不論使用 `vite` 還是 `Create React App` 這些建構工具的 React 開發都是以 CSR 為基底，但不免要碰上
