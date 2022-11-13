---
title: "Next系列 (二): SSG, SSR, ISR 如何在 Next 實踐"
date: 2022-10-07 10:23:58
tags: [next-js, react, framework]
toc: true
---

## Sever Side Rendering, SSR

SSR 適用於資料更新頻繁的場景，因為每當 client 端發送 request 時，伺服器就會即時處理資料，並將處理完的資料渲染成 html

可以類比為，有客人上門時畫家才會幫他畫一張畫，並加上當時的天氣作為背景，雖然可以因時制宜保持最新，但是畫家每次都要依照不同情況客製化，比較耗費心力，故伺服器負擔比較重

### 基本結構

如果想在 page 使用 SSR，典型的結構如下

```jsx
// 從 getServerSideProps 獲取 props
function Page({ data }) {
  // 渲染資料
}

export async function getServerSideProps() {
  // 從外部 API 獲取資料
  const res = await fetch(`https://.../data`);
  const data = await res.json();

  // 獲取的資料會傳進頁面 component 的 props
  return { props: { data } };
}

export default Page;
```

### `getServerSideProps`

`getServerSideProps` 要注意的有兩個:

1. 以具名方式導出 (named export)
2. 只能從 page 導出，不能獨立使用
3. 只在伺服器運行，而不是 client 端

Next.js 會使用 `getServerSideProps` 回傳的數據進行 pre-rendering，故會在 `getServerSideProps` 函數裡面獲取資料，通常呼叫外部 API 或是讀取外部檔案，最後將處理好的資料塞進 props，傳給該 page

## Static Site Generation, SSG

SSG 適用於資料更動不這麼頻繁的場景，像是部落格文章、產品頁面

SSG 是在 build time 時就把內容一次生成靜態的內容，而且除了靜態 html 之外，Next.js 還生成 JSON 以保存 `getStaticProps` 的雲行結果

如此一來，如果透過 `next/link` 轉換至使用 `getStaticProps` 的頁面，就可以直接調用 JSON

和 SSR 對比，SSG 可以類比成這個畫家只會固定套路，但是可以畫得很快，甚至還準備了好幾份複製品直接給客人

```js
// pages/posts/[id].js

// 產生 `/posts/1` and `/posts/2` 兩個動態路徑
export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: "1" } },
      { params: { id: "2" } },
      { params: { id: "3" } },
    ],
    fallback: false, // 可被設置為 true or 'blocking'
  };
}

// 一旦用了 `getStaticPaths` 當然也需要 `getStaticProps`
export async function getStaticProps(context) {
  return {
    // Passed to the page component as props
    props: { post: {} },
  };
}

export default function Post({ post }) {
  // Render post...
}
```

### `getStaticProps`

類似於 `getServerSideProps`，把呼叫的外部資料以 props 傳遞給 page ，但是只有在 build time 的時候才執行，至此生成完畢固定靜態內容，不像 SSR 隨叫隨到

- 啟動 `next build` 時總會運行
- dev 模式之下，每次 request 都會運行
- 可以使用 `preview mode` (使用於發佈文章前預覽畫面，日後研究)

### `getStaticPaths`

Next.js 擁有動態路由功能，以現實場景為例，只要在 `/posts/[id]` 這個路由代入不同的 id，即可根據該 id 渲染對應的文章

但是在 SSG 的體系中，html 都是在 build time 的時候事先被創建好的，如果要使用 SSG 又想要有動態路由的功能，我們需要使用`getStaticPaths` 先定義動態路由**有哪些可能的路徑**

例如: 有 3 篇文章，id 是 1 到 3，藉由 `getStaticPaths` 之中來定義動態路由的可能範圍是 `/posts/1` 到 `/posts/3`

不過通常是從獲取外部資料或外部檔案，來得知可能的路由範圍，而不是直接寫死

`fallback` 是個很重要的參數，如果設置 `fallback: false` 比較單純，如果輸入的網址路由超出 `getStaticPaths` 範圍會回傳錯誤訊息頁面

而當 `fallback` 是 `blocking` 或是 `true` 的時候，再加上 `revalidate` ，就會開啟 Next.js 的強大功能 -- Incremental Static Regeneration

## Incremental Static Regeneration, ISR

新聞網站或是大型電商網站的頁面有數十萬計，如果通通打包成靜態網頁會是天長地久，但如果又想享受 SSG 的好處怎麼辦？

Next.js 提供強大的 Incremental Static Regeneration 功能，簡言之，可以先把比較重要或是比較熱門的品項先框列好 (`getStaticPaths`)，並進行靜態生成，其餘的等到真的有 request 進來，再開始進行生成，呼叫 `getStaticProps()`（這個功能真的極神呀）

再搭配 `revalidate`，甚至可以讓頁面進行重新生成（和 SSR 的界線開始模糊化）

### 基本結構

```jsx
function Blog({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

export async function getStaticProps() {
  const res = await fetch("https://.../posts");
  const posts = await res.json();

  return {
    props: {
      posts,
    },

    revalidate: 10, // In seconds
  };
}

export async function getStaticPaths() {
  const res = await fetch("https://.../posts");
  const posts = await res.json();

  const paths = posts.map((post) => ({
    params: { id: post.id },
  }));

  return { paths, fallback: "blocking" };
}

export default Blog;
```

### `fallback`: ISR 的 Incremental

`fallback` 決定了如何進行處理 client 端輸入的網址路由不在 `getStaticPaths` 定義的範圍內

- `fallback: "blocking"`: 開啟類似 SSR 的模式，伺服器後台會開始執行 `getStaticProps` ，讓頁面卡在此階段進行等待，完成後將完整的 html 回傳 client
- `fallback: true`: 看範例比較直觀

```jsx
import { useRouter } from "next/router";

function Post({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  // Render post
  return <div>post.body</div>;
}
```

路由不在 `getStaticPaths` 範圍裡，代表頁面沒有被生成，此時 `isFallback` 會變為 true (`post` 這個 props 也會是空的)，藉由條件式先讓畫面渲染 Loading dummy 元件，一方面伺服器後台會開始執行 `getStaticProps`，完成生成後再更新頁面

### `revalidate` : ISR 的 Regeneration

`revalidate: 60` 是指 cache (生成的靜態頁面) 超過 60 秒就需要重新生成，看下圖範例比較直觀

![](https://i.imgur.com/7KltpZi.png)

1. 0-59 秒時，如果進行 request 返回的是一開始生成的結果
2. 超過 60 秒後，如果沒有新的 request，伺服器也不會自動進行重新生成 (不然主機會爆炸)
3. 超過 60 秒後，如果有新的 request，還是回傳原先的結果，但是另一方面 Next.js 伺服器後台會啟動重新生成，生成完畢後繼續倒數 60 秒
4. 重新生成後，下一個 request 會拿到新的生成結果（如果已經完成重新生成的話）

> 如果重新生成失敗，舊的生成還是保持著，避免直接看到錯誤頁面

## 結語

如果要測試 ISR 跟 SSG，強烈建議使用 `npm run build && npm start` 才會依照上線真實情況走，因為 dev 模式之下，`getStaticProps` 每次 request 都會啟動一次

## Ref

https://stackoverflow.com/questions/67787456/what-is-the-difference-between-fallback-false-vs-true-vs-blocking-of-getstaticpa
