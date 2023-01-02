---
title: "掌握 Scope Chain，避開變數 not defined"

date: 2023-01-03 13:43:00
tags: [javascript, "Scope chain"]
toc: true
---

:::info
本系列文章先以準備面試、快速回顧為主，行文較為簡略，前後的脈絡跟邏輯若有跳躍之處，敬請見諒
:::

## 前言

以函數來說，變數可以在函數內部宣告、參數給定，如果執行環境都沒有該變數時，會**向外層查找**，如下

```js
const globalText = "globe";

function simpleWrapper() {
  console.log(globalText);
}

simpleWrapper();
// globe
```

但如果，A 函數裡面有 B 函數，B 函數裡面又有 C 函數的情況下，這個「向外層查找」的依據跟順序又是什麼呢？

> 在範疇內找不到變數時，這個向外層查找的順序依據，便是 Scope chain!

## 範例

```js
const globalText = "globe";

function outside() {
  console.log(functionScopeText);
}

function complexWrapper() {
  const functionScopeText = "in wrapper";

  function inside() {
    function deeperInside() {
      console.log("deepInside", functionScopeText);
      console.log("deepInside", globalText);
    }
    deeperInside();
  }

  inside();
  outside();
}

complexWrapper();
```

大家覺得這個執行結果會是什麼？
一開始我會認為，既然 `outside()` 是在 `complexWrapper` 內部執行，那 `outside()` 裡所需要的變數，也就是 `functionScopeText` 應該可以向外查找取得，畢竟 :

1. `outside()` 是在 `complexWrapper` 內部所執行
2. `functionScopeText` 也在 `complexWrapper` 內部所宣告

非也非也！

## Lexical Scope

一個函數執行向外查找的依據順序，是依照 Lexical Scope 決定的，**也就是取決於你的函數在哪裡被宣告**

Lexical Scope 的特性 :

1. JavaScript 是採用 Lexical Scope ( 語彙範疇 )
2. 外層 Scope 無法取用內層變數，但內層 Scope 可以取用外層變數
3. 程式碼的擺放位置跟巢狀關係決定 Lexical Scope

所以我們可以總結

1. `outside()` 的**位置**是在全域環境被宣告，所以向外查找就只會往全域環境查找，全域上去已經是最頂層了
2. `complexWrapper` 函數包裹著 `inside`，`inside`函數又包裹著 `deeperInside`，像是這樣的關係 :

- `complexWrapper`
  - `inside`
    - `deeperInside`

所以 `deeperInside` 所需要的 `functionScopeText`

1. 若找不到，先向外查找 `inside` 的 scope
2. 若再找不到，再向外查找`complexWrapper` 的 scope
3. 到最後如果還是找不到，查找全域環境

這樣一層一層向外查找的順序依據，也就是 Scope chain 了

以上程式碼可以到 [codesandbox](https://codesandbox.io/s/scope-chain-h4zrhx?file=/src/index.js) 執行看看

## Reference

[JS 原力覺醒 Day05 - Scope Chain](https://ithelp.ithome.com.tw/articles/10217997)
