---
title: 打造舒爽的一鍵排版：ESlint、Prettier、VS code
date: 2022-11-05 10:19:00
tags: [react, eslint, prettier]
toc: true
---

## 前言

每個人寫程式的習慣不太一樣，一人 side project 事小，如果多人協作起來，大家風格不一致就是一件很惱人的事情了，這篇筆記就是希望運用 ESlint 和 Prettier 在 VS code 建構一個舒服的 Code Formatting 機制

本筆記希望達到的目的:

- 套用 airbnb style 的 ESlint
- 了解 ESlint 設定檔基本介紹
- 讓 Prettier 跟 ESlint 不要打架
- VS code 設定檔
- 一鍵搞定程式碼排版與風格
- (加碼) tailwind 與其 Prettier plugin 設定

## 事前準備

- 裝好 npm
- 裝好 VS code
- 裝 ESlint 和 Prettier

```
npm install --save-dev --save-exact prettier
npm install eslint --save-dev
```

- 裝 [VSC ESlint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- 裝 [VSC Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## ESlint vs. Prettier

- ESlint: 「檢查」程式碼有沒有符合良好且一致的風格，例如：不要使用 var、某些變數被宣告了卻沒有使用、註解的規則...等
- Prettier: 「排版」程式碼，像是拿掉多餘的空格，一個縮排要用幾格 space

可以見得兩者功能不太一樣，卻有一些重疊導致衝突發生，例如在 VScode 設定存檔時自動使用 Prettier 排版，但是出來的結果不符合 ESlint ，讓程式碼多了許多警告訊息，後續章節會介紹如何解這個衝突

## Airbnb Style

現在 Javascript 的程式碼主流規範有 Airbnb、Google、以及 JavaScript Standard Style，而 Airbnb 在近期比較火熱，也嚴謹很多

想起剛安裝的時候，在編輯器上的畫面滿滿紅蚯蚓，原來我的程式碼是好肥沃的田...

不熟 ES6 的新手一開始使用可能會感到挫折，連程式都不一定寫出來了，還要管一堆寫法規範，警告會多到讓你分不清楚是風格錯誤還是整個程式都寫錯

反之 JS 上手後再來使用，這些機制會讓程式碼變得更簡潔、更合理，風格也更一致

可以先從 [Airbnb Style Guide](https://github.com/airbnb/javascript) 先一窺如何進行寫法上的建議與規範

### 安裝 Airbnb Style

```
npx install-peerdeps --dev eslint-config-airbnb
```

這會幫你安裝許多依賴套件

- eslint
- eslint-plugin-import
  - import 套件時的 eslint rules
- eslint-plugin-react
  - react 的 eslint rules
- eslint-plugin-react-hooks
  - react custom hook 的 eslint rules
- eslint-plugin-jsx-a11y
  - jsx a11y ( accessibility, 無障礙設計 ) 的 eslint rules

事實上 `eslint-config-airbnb` 就是使用這些 ESlint 的「規則大全」，然後再自己加以魔改，組合出他們自己的「風格規範」

## ESlint 的設定檔基本介紹

先大致了解，才能比較知道知道後面在幹嘛

```json
{
  "root": true,
  "settings": {},
  "env": {
  },
  "parserOptions": {
    "ecmaVersion":
    "sourceType":
    "ecmaFeatures": {
    }
  },
  "extends": [],
  "plugins": [],
  "rules": {
  }
}
```

- `env` : 讓 ESLint 知道程式碼在什麼環境運行，這樣才知道有哪些預設的環境變數跟全域變數，常見的有
  - `browser` : 瀏覽器
  - `node` : nodeJS
  - `es6`
  - 更多詳見 [官方文件](https://eslint.org/docs/latest/user-guide/configuring/language-options#specifying-environments)
- `parserOptions` : 讓 ESlint 知道如何解析程式碼，沒有設定的話會看不懂 `.jsx`
  - `ecmaVersion` : JS 版本，如果有用到最新的功能可以設定為`2021`
  - `sourceType` : `module` 有用到 ECMAscript 的 module 功能就打開
  - `ecmaFeatures` : `"jsx": true` 打開 `.jsx` 功能
  - 更多詳見 [官方文件](https://eslint.org/docs/latest/user-guide/configuring/language-options#specifying-parser-options)
- `plugins`: 像是一本「規則字典」，清楚詳列有哪些規則可以使用（但是沒有設定哪些規則要被啟用），例如`eslint-plugin-react` 裡面就是制定許多規則可以讓你規範 react 的程式碼
- `extends`: 從 `plugin` 和 `rules` 作為組件，組合出自己的風格規範集，並且按照輕重緩急制定，比較嚴重的程式瑕疵直接報錯，次要的只秀 warning 警告
  - 這裡要做的就是載入別人制定好的 `extends`
- `rules`: 自己客製化並覆寫 ESlint 規則，如果有些 ESlint 規範讓你不堪其擾，可以在這裡關掉
  - `"off"` or `0` - 關掉該規則，直接安靜
  - `"warn"` or `1` - 打開該 rule，但只是警告
  - `"error"` or `2` - 打開該 rule，若違反會直接跳 error

## 解決 Prettier 和 ESlint 之間的衝突

```
npm install --save-dev eslint-plugin-prettier
npm install --save-dev eslint-config-prettier
```

`eslint-plugin-prettier` : 把 Prettier 排版的方式，變成 ESlint 的 rules

`eslint-config-prettier` : 關掉 ESLint 可能會跟 Prettier 衝突的 rules

## 實作開始！

直接來從實作步驟看比較快了

### `.eslintrc.json`

在專案根目錄新增一個 `.eslintrc.json`

```json
// .eslintrc.json
{
  "root": true,
  "settings": {},
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": ["airbnb", "plugin:react/jsx-runtime", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": ["warn", {}, { "usePrettierrc": true }],
    "react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx"] }]
  }
}
```

- `extends": ["airbnb", "plugin:react/jsx-runtime", "prettier"]`
  - 載入 airbnb 就會自動把需要的 plugin 都載進來了
  - `jsx-runtime` [詳見官方文件](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md#when-not-to-use-it)
  - Prettier 記得放在最後一個 (官方文件說的)
- `"prettier/prettier": ["warn", {}, { "usePrettierrc": true }]`
  - 讀取資料夾底下的 Prettier 設定檔，把 Prettier 的排版方式加入 ESlint rules
- `"react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx"] }]`
  - airbnb 預設 `.jsx` 才能使用 `jsx` 語法，但這樣有點太嚴格了，設定 `.js` 也可以使用 `jsx` 語法

### `.prettierrc`

在專案根目錄新增一個 `.prettierrc`，設置 Prettier 的排版方式

[詳細官方文件](https://prettier.io/docs/en/options.html)

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

- `tabWidth`: 一個縮排要用幾個 space
- `semi`: 自動加分號
- `singleQuote`: 都使用單引號
- `trailingComma`: `"es5"` 會幫你在每個 object 或 array 最後一個 property (or element) 自動加上`,`

### `.vscode/settings.json`

在專案根目錄新增一個資料夾 `.vscode`，並在底下新增 `settings.json`

```json
// settings.json
{
  // 存檔時就自動排版
  "editor.formatOnSave": true,

  // 使用 Prettier作為預設排版
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // 存檔的時候自動 autofix eslint的錯誤
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },

  // 寫 react也能啟用 tailwind 的自動提示
  "tailwindCSS.includeLanguages": {
    "javascript": "javascriptreact"
  },

  // 寫 react也能啟用 emmet
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },

  "eslint.options": {
    "overrideConfigFile": ".eslintrc.json"
  },
  "editor.tabSize": 2,
  "javascript.preferences.quoteStyle": "double",
  "prettier.configPath": ".prettierrc"
}
```

來看比較重要的一段

```
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
 },
```

ESlint 有 fix 功能，盡可能幫你修正不符合 rules 的地方，這段設定，就是存檔的時候把所有 ESlint 跳出的錯誤，全部盡可能修正掉

## 從頭建立懶人包

- react
- eslint
- airbnb style
- prettier
- tailwind & prettier 自動排序

### 安裝 react

vite or creat-react-app 任選

```
npm create vite@latest
```

```
npx create-react-app my-app
cd my-app
npm start
```

### 安裝 ESlint 與 Prettier

```
npm install --save-dev --save-exact prettier
npm install eslint --save-dev
npx install-peerdeps --dev eslint-config-airbnb
npm install --save-dev eslint-plugin-prettier
npm install --save-dev eslint-config-prettier
```

### 加入設定檔

- 加入檔案

  - `.eslintrc.json`
  - `.prettierrc`

- 創立資料夾`.vscode`，在裡面加入 `settings.json`

(設定檔都在文章上面)

### 安裝 tailwind

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

調整 tailwind 設定檔 `tailwind.config.cjs`

```cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

`index.css` 設定

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
}
@layer components {
}
@layer utilities {
}
```

### 安裝 tailwind prettier 自動排序

這是 Prettier 的 plugin，直接裝就好了
可以自動 format tailwind 的 class 順序

```html
<!-- Before -->
<button
  class="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800"
>
  ...
</button>

<!-- After -->
<button
  class="bg-sky-700 px-4 py-2 text-white hover:bg-sky-800 sm:px-8 sm:py-3"
>
  ...
</button>
```

```
npm install -D  prettier-plugin-tailwindcss
```

### 選配

- `.eslintignore`
- `.prettierignore`

```
node_module
```

可以設定哪些檔案會被忽略，可以遵循 `gitignore` 的原則

### VS code ESlint 小提醒

有時自己不小心改壞了什麼，導致 ESlint 的功能在 VS code 上發生問題，可以 `cmt + shift + p` 打開指令列，搜尋 `ESLint: Show Output Channel` 把 ESlint 的運行 output 顯示出來，看看哪裡出問題

### 完工

Enjoy it !

或是[直接 clone 下來用](https://github.com/alexlautw9527/react-startup-vite)

## Ref

[Eslint 中 plugins 和 extends 的区别
](https://juejin.cn/post/6859291468138774535)

[eslintignore 的忽略配置
](https://juejin.cn/post/7007603848080523278)
