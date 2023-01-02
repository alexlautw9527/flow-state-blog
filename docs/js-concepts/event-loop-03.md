---
title: "理解 Event Loop (三) - Macro & Micro"
date: 2023-01-03 13:43:00
tags: [javascript, "Event Loop"]
toc: true
---

## 前言

Micro Task 跟 Macro Task 是 Event Loop 的最後一塊拼圖，我們可以將任務區分為 Macro ( 宏觀 ) 與 Micro ( 微觀 )，因為這兩個英文單字看起來實在太像了，後面盡量先以中文代稱

**宏任務 Macro Task**

- **script ( Javascript 整體程式碼 )**
- `setTimeout`
- `setInterval`
- `setImmediate`
- I/O UI 互動相關

**微任務 Micro Task**

- `Promise` 的 .then / .catch
- `process.nextTick` (Node.js)
- `MutationObserver`

如此一來，Queue 又一分為二 : **Macro Queue、Micro Queue**，也就是存放兩種不同性質的 Queue，其順序如下

1. 當宏任務執行完畢後 (包含但不限於 宏任務 Queue，因為整體 script 執行也算宏任務)，會去檢查微任務 Queue 有沒有東西
2. 若 Micro Queue 有微任務在等待，就一口氣執行完目前所有在序列的微任務
3. 渲染 UI
4. 繼續下一個宏任務

## 範例

```js
console.log("Start");
Promise.resolve().then(() => {
  console.log("Promise");
});
setTimeout(() => {
  console.log("setTimeout");
}, 0);
console.log("End");

// output:
// Start
// End
// Promise
// setTimeout
```

- **一個宏任務開始 ( 執行整體 script )**
  - 印出 `console.log("Start")`
  - `Promise.resolve().then()` then()裡面的 callback **放入微任務 Queue**
  - `setTimeout` 開始計時，計時完 callback **放入宏任務 Queue**
  - 印出 `console.log("End")`
  - **一個宏任務結束 ( 整體 script 執行完畢 )**
- 開始執行微任務 Queue
  - 印出 `console.log("Promise")`
- 開始執行下一個宏任務 ( 在宏任務 Queue 裡的任務)
  - `console.log("setTimeout")`

## 魔王範例

```js
console.log(1);

setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);

new Promise((resolve, reject) => {
  console.log(4);
  resolve(5);
}).then((data) => {
  console.log(data);
});

setTimeout(() => {
  console.log(6);
}, 0);

console.log(7);
```

試著回答看看 console.log 分別會印出什麼

<details>
  <summary>點擊看答案</summary>
  <div>
    1 -> 4 -> 7 -> 5 -> 2 -> 3 -> 6
  </div>
</details>

## 小結

微任務會穿插在每個宏任務之間

又可以說，以第一次執行來看，微任務 Queue 會優先於 宏任務 Queue

## Reference

[聊聊 JavaScript 异步中的 macrotask 和 microtask](https://www.cnblogs.com/wonyun/p/11510848.html)

[JS 原力覺醒 Day15 - Macrotask 與 MicroTask](https://ithelp.ithome.com.tw/articles/10222737)

[Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

[淺談 JavaScript 中的 Event Queue、Event Table、Event Loop 以及 Event Task](https://israynotarray.com/javascript/20211116/1549480598/)
