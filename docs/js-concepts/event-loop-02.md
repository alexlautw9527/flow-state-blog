---
title: "理解 Event Loop (二) - 來講真正的 Event Loop"
date: 2023-01-03 13:43:00
tags: [javascript, "Event Loop", "Execution Context", Stack]
toc: true
---

:::info
本系列文章先以準備面試、快速回顧為主，行文較為簡略，前後的脈絡跟邏輯若有跳躍之處，敬請見諒
:::

## 前言

![](imgs/event-loop.gif)

先以 Philip Roberts 著名的講解影片來鎮樓

瀏覽器可以分成三大塊

1. Javascript 引擎
   - Stack : 沒錯，就是前一篇講的 Stack
   - Heap : 變數、函數等等存放的記憶體空間
2. Web API
   - 其實這些東西都不包含在 JS 引擎裡面，而是瀏覽器內部的 API，例如：
   - onClick 事件
   - ajax : 發出非同步請求
   - setTimeOut : 計時器
3. Callback Queue ( 或稱 Event Queue )

## 範例 1

```js
console.log("Hi!");

setTimeout(function timeout() {
  console.log("Time is out");
}, 5000);

console.log("This is second one");
```

請搭配[視覺化](http://latentflip.com/loupe/?code=Y29uc29sZS5sb2coIkhpISIpOwoKc2V0VGltZW91dChmdW5jdGlvbiB0aW1lb3V0KCkgewogICAgY29uc29sZS5sb2coIlRpbWUgaXMgb3V0Iik7Cn0sIDUwMDApOwoKY29uc29sZS5sb2coIlRoaXMgaXMgc2Vjb25kIG9uZSIpOwo%3D!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D)服用

執行順序

1. 程式碼碰到 `console.log("Hi!")` 放進 Call Stack，執行並 pop off
2. 程式碼碰到 `setTimeout`
   - oh 這個是一個非同步 Web API，這就是重點了
   - **先移交給 Web API 開始計時** ( 此時還不會執行裡面的 callback function )
3. 程式碼碰到 `console.log("This is second one")` 放進 Call Stack，執行並 pop off
4. 5 秒到了，把 `setTimeout` 裡面的 callback 放到 Queue
5. Stack 清空了，好的，可以把 Queue 裡面的任務放進去 Stack 繼續執行了，執行 `console.log("Time is out")`

## 範例 2: 真正理解 Event Loop

```js
console.log("Hi!");

setTimeout(function timeout() {
  console.log("Time is out");
}, 0);

console.log("This is second one");
```

如果將 `setTimeout` 改為計時 0 秒會發生什麼事？ 執行順序還是一樣 "Hi"、"This is second one"、"Time is out"，不會因為 0 秒就讓 `setTimeout` 內的 callback 變成立即執行

來總結一下 Event Loop 的執行過程

1. 一般的程式，Call Stack 如往常般運行執行程式碼，
2. 碰到非同步的部分，例如 `setTimeOut`、`ajax` 則移交給 Web API 進行處理
3. `setTimeOut`、`ajax` 處理完畢後，把後續的 callback 放進 Event Queue
4. **Event Loop 會不斷不斷檢查 Stack，若 Stack 已經空了，就把 Queue 的東西抓過來放到 Stack**

> 要注意的是，Event Queue 中的 「Queue」，也是一種資料結構，和 Stack 不一樣，是採先進先出 ( FIFO ) ，最先進來的就先執行

我們可以繼續在[這裡](http://latentflip.com/loupe/?code=Y29uc29sZS5sb2coIkhpISIpOwoKc2V0VGltZW91dChmdW5jdGlvbiB0aW1lb3V0KCkgewogICAgY29uc29sZS5sb2coIlRpbWUgaXMgb3V0LCBvbmUiKTsKfSwgNTAwMCk7CgpzZXRUaW1lb3V0KGZ1bmN0aW9uIHRpbWVvdXQoKSB7CiAgICBjb25zb2xlLmxvZygiVGltZSBpcyBvdXQsIHR3byIpOwp9LCA1MDAwKTsKCgpjb25zb2xlLmxvZygiVGhpcyBpcyBzZWNvbmQgb25lIik7Cg%3D%3D!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D)知道，若有兩個 `setTimeOut`，到了 Event Queue 的時候，最先進來會最先執行，其實就是依照

## 小結

白話來說，Event Loop 會先讓 Stack 優先處理**同步**的程式碼，**非同步**則轉移瀏覽器 Web API 處理，等到**同步**的部分都已完成 ( Stack 被清空 )，再來繼續收尾**非同步**的程序

以實際運作機制來看，Event Loop 是一個司令，不斷檢查 `Call Stack` 是不是空的，若已被清空，再來開始 `Event Queue` 的東西塞到 `Stack`

但是如果再把 `Promise` 考慮進去，非同步的部分又可以區分 `Macro Task` 跟 `Micro Task`了，這兩個不同性質，會影響非同步的優先順序，下回分曉

## Reference

[所以說 event loop 到底是什麼玩意兒？| Philip Roberts | JSConf EU
](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
