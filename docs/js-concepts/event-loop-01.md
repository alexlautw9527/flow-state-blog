---
title: "理解 Event Loop (一) - 先談 Execution Context 和 Call Stack"
date: 2023-01-02 13:43:00
tags: [JavaScript, "Event Loop", "Execution Context", Stack]
toc: true
---

:::info
本系列文章先以準備面試、快速回顧為主，行文較為簡略，前後的脈絡跟邏輯若有跳躍之處，敬請見諒
:::

## 前言

JavaScript 是 **單執行緒** 的語言，意思是每次只做一件事。但是在網頁許多互動功能，都會關係到「非同步」行為，例如：呼叫 API、`setTimeOut` 計時，若執行太久會形成 **blocking** ，後續的程序都被卡住不能執行，導致使用體驗不佳

Event Loop 就是要解決這樣的問題，調和「同步」與「非同步」

白話來說，會優先處理**同步**的程式碼，**非同步**則轉移瀏覽器 Web API 處理，等到**同步**的部分都已完成，再來繼續收尾**非同步**的程序

以實際運作機制來看，Event Loop 是一個司令，不斷檢查 `Call Stack` 是不是空的，若已被清空，再來開始 `Event Queue` 的東西塞到 `Stack`

但談到 `Call Stack`，又要談到 `Execution Context` 了

## 先談 Execution Context ( 執行環境 )

Execution Context 的主要類型 :

1. Global Execution Context (每個 JavaScript 程式檔只會有一個)
2. Functional Execution Context (執行函數時會建立)

其實 Execution Context 像是沙盒一般，每個 Context 每個都有獨立自主的環境

> 其實還有 eval 內的 Execution Context，但先略過，不建議使用，關鍵字搜尋 `eval is evil`

### Global Execution Context

一開始瀏覽器執行 JavaScript 時，首要的預設執行環境，其中又分成兩階段

1. 創造階段
2. 執行階段

**創造階段** Global Execution Context 創立時會做三件事

1. 創造 全域環境，也就是全域物件 `window`
2. 創造 一個 `this` 變數，指向 `window`
3. 進行記憶體指派，先將變數和 function 分配至記憶體，這也是 **Hoisting** 的來由
   - 變數 : 宣告的變數會先預先指派記憶體，但不會被 **賦值** ，此時值為 `undefined`

**執行階段** 如人類直覺，程式碼會由上而下，逐行執行

1. 對變數進行賦值
2. 碰到 function call，則暫時停止 global 執行階段，新增 Functional Execution Context，**並把該 Context 加入 Execution Stack**

### Functional Execution Context

當函數被調用時，就開始 Functional Execution Context，也一樣分成 **創造階段、執行階段**

**執行階段** 還是一樣，程式碼會由上而下，逐行執行

1. 對變數進行賦值
2. 裡面又碰到 function call，則暫時停止執行，新增 Functional Execution Context，**並把該 Context 加入 Execution Stack**

### Execution Stack (Call Stack)

**Stack** 是一種 先進後出 (LIFO) 的 **資料結構**， Call Stack 則 **以這種資料結構來制定任務的執行順序**

什麼是先進後出呢？可以想像：把品克洋芋片一片一片裝進罐子，裝滿之後，第一片會在最下面，可是開始吃的時候是從最後一片，也就是最上面那一片開始吃

或是，可以想像每一個 Execution Context 就是一張待辦清單便條紙，這個過程是 while loop

1. 碰到 function call 就是把一張新的便條紙覆蓋上去，待辦事項就是 function 內的程式碼
2. 開始**依序執行**便條紙內的待辦事項
   1. 如果待辦事項沒有 function call，沒事了，這個 function 執行完畢就可以把便條紙撕掉
   2. 但如果又碰到 function call，就暫停，貼上一張新的便條紙
3. ( 持續檢查最上面一層有沒有便條紙，如果有，就繼續**依序執行**裡面的待辦事項 ）

Call Stack 是理解 Event Loop 的階梯之一，這個部分需要視覺化跟舉例，一步一步走過，才會比較清楚

我們以下面程式碼來理解 Call Stack

```js
function openBox1() {
  console.log("這裡是盡頭了");
}

function openBox2() {
  openBox1();
  console.log("Box2 解析完畢");
}

function openBox3() {
  openBox2();
  console.log("Box3 解析完畢");
}

openBox3();
// 印出的順序為 "這裡是盡頭了"、"Box2 解析完畢"、"Box3 解析完畢"
```

1. 開始執行 `openBox3`，進入函數
   - 此時堆疊為 `[openBox3]`
2. in `openBox3`
   - 開始執行，碰到需調用 `openBox2()`，暫停並進入`openBox2()` 函數
   - 此時堆疊為 `[openBox3, openBox2]`
3. in `openBox2`

   - 開始執行，碰到需調用 `openBox1()`，暫停並進入`openBox1()` 函數
   - 此時堆疊為 `[openBox3, openBox2, openBox1]`

4. in `openBox1`

   - 碰到 `console.log("這裡是盡頭了")`，加入 Stack
   - 此時為`[openBox3, openBox2, openBox1, console.log("這裡是盡頭了")]`
   - `console.log` 執行完畢，pop off，此時為`[openBox3, openBox2, openBox1]`
   - 函數內容全數執行完畢，pop off `openBox1`，此時為`[openBox3, openBox2]`

5. 重新回到 `openBox2`

   - 碰到 `console.log("Box2 解析完畢")`，加入 Stack
   - 此時為`[openBox3, openBox2, console.log("Box2 解析完畢")]`
   - `console.log` 執行完畢，pop off，此時為`[openBox3, openBox2]`
   - 函數內容全數執行完畢，pop off `openBox2`，此時為`[openBox3]`

6. 重新回到 `openBox3`
   - 碰到 `console.log("Box3 解析完畢")`，加入 Stack
   - 此時為`[openBox3, console.log("Box1 解析完畢")]`
   - `console.log` 開始印出，執行完畢，把該洋芋片 pop off，此時為`[openBox3]`
   - 函數內容全數執行完畢，pop off `openBox3`，此時為`[]`，全部清空了！

文字容易頭昏眼花，可以直接進入這個[視覺化網站](http://latentflip.com/loupe/?code=ZnVuY3Rpb24gb3BlbkJveDEoKSB7CiAgICBjb25zb2xlLmxvZygnVGhpcyBpcyB0aGUgRU5EJyk7Cn0KCmZ1bmN0aW9uIG9wZW5Cb3gyKCkgewogICAgb3BlbkJveDEoKTsKICAgIGNvbnNvbGUubG9nKCdCb3gyIGZpbmlzaGVkJyk7Cn0KCmZ1bmN0aW9uIG9wZW5Cb3gzKCkgewogICAgb3BlbkJveDIoKTsKICAgIGNvbnNvbGUubG9nKCdCb3gzIGZpbmlzaGVkIScpOwp9CgpvcGVuQm94MygpOyA%3D!!!PGJ1dHRvbiBpZD0iY2xpY2tCdG4iPkNsaWNrIG1lITwvYnV0dG9uPg%3D%3D)

## 總結一下

- 不考慮 Hoisting 的話，程式碼都是由上而下執行，但如果碰到 function call，就需要探討 Call Stack
- 在 Call Stack 當中要注意的是，Global Execution Context 會是第一張待辦清單便條紙，若碰到 function call 就會新增一張待辦清單便條紙，並且疊上去 Stack，依序執行待辦清單
- 「執行時碰到 function call」 其實就是在 Call Stack 新增一張 Function Execution Context 便條紙疊上去
- 不斷檢查是否還有便條紙，若有，就繼續最上面那張，依序執行，直到所有便條紙都被清空

## Reference

[JS 原力覺醒 Day03 - 執行環境與執行堆疊
](https://ithelp.ithome.com.tw/articles/10216450)

[透過程式範例，熟悉 JS 執行流程的關鍵：Event Loop](https://www.programfarmer.com/articles/JavaScript/JavaScript-browser-event-loop)

[JavaScript: Call Stack Explained](https://JavaScript.plainenglish.io/node-call-stack-explained-fd9df1c49d2e)
