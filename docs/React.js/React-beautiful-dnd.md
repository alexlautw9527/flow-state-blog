---
title: 從理解到實作 React-beautiful-dnd
date: 2022-10-07 10:23:58
tags: [react, dnd]
categories: react
toc: true
---

## 簡介

React 生態圈之中有三個知名的 DnD (Drop and Drag) 套件:

- react-beautiful-dnd
- react-dnd
- react-draggable

這三者的 star 數和 npm 下載數都很高，但適用場景略有不同

react-draggable 比較像是可以隨意拖曳的「便利貼」，react-dnd 操作上更為底層、自定義成分也更高，意味著需要更多開發時間

而 react-beautiful-dnd 背後大哥是 Atlassian ，旗下的明星產品是 Trello 以及 Jira，此套件的應用場景也是為了卡片拖曳清單應用而生，正好與這次使用情境十分契合，故本次選用 react-beautiful-dnd 進行實作教學

## 本文需要的預備知識

- [React hook](https://beta.reactjs.org/)
- 一些 [style-components](https://styled-components.com/)（不影響整體理解）
- JS ES6 與 [array 操作](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [npm](https://medium.com/html-test/%E5%BE%9E%E9%9B%B6%E9%96%8B%E5%A7%8B-%E4%BD%BF%E7%94%A8npm%E5%A5%97%E4%BB%B6-317beefdf182) 與 [React 環境建立](https://create-react-app.dev/)

## 環境安裝

可以選擇使用 [Create React App](https://create-react-app.dev/) 來建立 React 環境，並以 npm 安裝以下所需套件

```bash
npm install react-beautiful-dnd --save
npm install nanoid --save
npm install styled-components --save
```

`nanoid` 是為了產生 unique id 以利套件使用，`styled-components` 則是用來進行 css 樣式設定

## 套件元件基本架構

![](https://blog.laiweb.org/src/images/drag-example.gif)

在 react-beautiful-dnd 當中，最重要的三個元件分別為 `<DragDropContext>`、`<Droppable>` 和 `<Draggable>` ，尤其 `<Droppable>` 和 `<Draggable>` 字母組成實在很像，以下先分別以直觀概念介紹這幾個元件的主要用途

`<Draggable>`: 可以類比為**用來拖曳的卡片**

`<Droppable>`: 容納許多個 `<Draggable>` (拖曳卡片)的清單容器

`<DragDropContext>`: Drag n Drop 的 context 容器，可以允許有多個 `<Droppable>` ，藉此做到卡片在多個清單之間互相拖曳

## 套件元件使用：基本介紹與知識

- `<Droppable>` (容納許多張卡片的容器):
  - `children` prop 規定是一個**返回 react element 的函數**，以 `provided`, `snapshot` 這兩個 object 為參數 (有點奇葩，但是設計就是如此，先接受他 XD)
  - `droppableId` prop，該 `<Droppable>` 的唯一識別 ID，**如果有多個 `<Droppable>` 時，進行判定特別有用**
- `<Draggable>` (可拖曳的卡片):
  - 通常以 array.map 的方式來 render
  - `<Draggable>` 內部 `children` 則和 `<Droppable>` 相同，是一個返回 react element 的函數，也是以 `provided`, `snapshot` 為參數
  - `draggableId`: 該 `<Draggable>` 的唯一識別 ID
  - `index`: 卡片的順序

> `provided`, `snapshot` 的大致內容會稍後講解，而 `<Droppable>` 和 `<Draggable>` 的 property 略有不同

## 程式碼基本架構

```jsx
// 先宣告簡單的["A", "B", "C"]作為 state,作為 Draggable 內容
const [items, setItems] = useState(["A", "B", "C"]);
```

```jsx
<DragDropContext>
  <Droppable droppableId="drop-id">
    {/* // droppableId: 該 Droppable 的唯一識別ID */}

    {(provided, snapshot) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {/*
          provided.innerRef
          套件的機制所需, 直接去取用 dom 的 ref, 就是套用的例行公事
        */}

        {items.map((item, index) => (
          // 以 map 方式渲染每個拖曳卡片 (Draggable)

          <Draggable draggableId={item.id} index={index}>
            {/* // draggableId: 該卡片的唯一識別ID */}
            {(provided, snapshot) => (
              /* 
                ...provided.droppableProps
                ...provided.draggableProps
                ...provided.dragHandleProps 
                單純展開其他必要的 props 
              */

              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {/* 實際上的卡片內容 */}
                {item}
                {/* 實際上的卡片內容 */}
              </div>
            )}
          </Draggable>
        ))}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

第一時間看到這個架構可能較難立刻理解，在此以筆者目前理解來逐步詳細解析：

1.  `<Droppable></Droppable>` 之間 (children)要包一個函數，並且以 `provided`, `snapshot` 作為參數
2.  這個函數要 return 出 react element，通常自行給定 `div` 作為容器，這個 `div` 就是實際上要作為`<Droppable>` 的元件，若有需要可用 css 自定樣式
3.  這個容器 `div` 需要掛上 `{...provided.droppableProps} ref={provided.innerRef}` 這些 props，藉此讓自行給定的 `div` 可以運作套件功能

在上述提及的 `<Droppable>` 底下的 `div` 之間，塞入 `<Draggable>` 作為卡片，`<Draggable>` 的概念也如出一轍

1.  `<Draggable> </Draggable>` 之間要包一個函數，並且以`provided`, `snapshot` 作為參數
2.  這個函數要 return 出一個 react element ，自行給定 `div` 作為卡片的容器，裡面塞入實際卡片內容，且可自定樣式
3.  這個容器 `div` 需要給定 `ref={provided.innerRef} {...provided.draggableProps {...provided.dragHandleProps}` 這些 props，藉此讓自行給定的`div`可以運作套件功能

一開始先不加任何樣式，專注在最簡單的範例實現，如此一來 A、B、C 可以拖曳了，但是拖曳完並不會確實更新，還是會回到原來順序

因為後續需要給定 `onDragStart`, `onDragUpdate`, `onDragEnd` (必填)來決定拖曳生命週期的事件函數 (Responders)

## Responders Life cycle

首先，這些事件函數要放在 `<DragDropContext>` 的 props，可先 console.log 一覽傳入的參數內容有什麼

```jsx
<DragDropContext
  onBeforeCapture={(e) => console.log("onBeforeCapture: ", e)}
  onBeforeDragStart={(e) => console.log("onBeforeDragStart: ", e)}
  onDragStart={(e) => console.log("onDragStart: ", e)}
  onDragUpdate={(e) => console.log("onDragUpdate: ", e)}
  onDragEnd={(e) => console.log("onDragEnd: ", e)}
>
```

`onBeforeCapture`、`onBeforeDragStart` 較進階先不談，先介紹最重要的三個

- `onDragStart`: 拖曳行為開始時觸發
- `onDragUpdate`: 拖曳行為讓順序產生變動時觸發
- `onDragEnd`: 最重要且必填，當拖曳行為結束時，決定怎麼更新 `<Draggable` 順序的函數

> [套件 github 詳細文件說明](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md)

![](https://i.imgur.com/OWQVR1A.png)

若將 C 拖曳到排序第 1 個，再觀察 `onDragEnd={(e) => console.log("onDragEnd: ", e)}` 可以得到兩個最重要的 property:

- `source`
  - 被拖曳的卡片**原先的** DroppableId 與順序
  - C 原本在第 3 個 (index=2)
- `destination`
  - 被拖曳的卡片**最終的** DroppableId 與順序
  - C 被拖曳到第 1 個 (index=0)

接著用 `onDragEnd` 傳入的 event 物件，根據 source 跟 destination 來組出新的 state，並進行更新，再觸發 re-render `<Draggable>`

```jsx
const onDragEnd = (event) => {
  const { source, destination } = event;

  if (!destination) {
    return;
  }

  // 拷貝新的 items (來自 state)
  let newItems = [...items];

  // 用 splice 處理拖曳後資料, 組合出新的 items
  // splice(start, deleteCount, item )

  // 從 source.index 剪下被拖曳的元素
  const [remove] = newItems.splice(source.index, 1);

  //在 destination.index 位置貼上被拖曳的元素
  newItems.splice(destination.index, 0, remove);

  // 設定新的 items
  setItems(newItems);
};
```

<iframe src="https://codesandbox.io/embed/very-basic-react-dnd-add-ondragend-12g8cw?fontsize=14&hidenavigation=1&theme=dark"
     title="very-basic-react-dnd (add onDragEnd)"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

如此一來 ABC 的順序在拖曳後可以成功更新了

## `<Droppable>` : `provided` and `snapshot`

這個章節簡介 `<Droppable>` 的 `provided` 和 `snapshot` 大致上會有什麼 property

### `provided`

- `provided.innerRef`
  - 將做為 `<Droppable>` 的 `div` 容器 ref 綁上 `provided.innerRef` 才能使套件運作正常
- `provided.placeholder`
  - 讓卡片拖曳時有空間

### `snapshot`

- `isDraggingOver`
  - 此 `Droppable` 是否開始被拖曳
- `draggingOverWith`
  - `Droppable` 的哪個卡片 id 正在被拖曳

`<Droppable>` 和 `<Draggable>` 各自的詳細資訊可參閱文件，可進行更細緻的自定義

> `<Droppable>` [詳細文件](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md#children-function)
>
> `<Draggable>` [詳細文件](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/draggable.md#children-function-render-props--function-as-child)

## 實作 - Backlog 與 Spring 拖曳清單

<iframe src="https://codesandbox.io/embed/very-basic-react-dnd-multiple-droppable-62vsgd?fontsize=14&hidenavigation=1&theme=dark"
     title="very-basic-react-dnd (multiple droppable)"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

前些章節完成了 react-beautiful-dnd 的基本操作，在這個章節中將會進一步介紹如何實現兩個 `<Droppable>` 之間的拖曳，並偵測 Sprint 清單的點數是否已達到上限，這次使用 style-component 來設定 css 樣式

本次實作有兩個`<Droppable>`清單，需將 state 設為比較複雜的物件格式，用以分開 backlog 和 sprint 的卡片內容，並建立 `totalScoreSum` state 記錄目前使用的點數狀況

```jsx
const [itemObj, setItemObj] = useState({
  productBacklog: {
    items: [
      {
        content: "前台職缺列表（職缺詳細內容、點選可發送應徵意願）",
        id: nanoid(),
        score: 5,
      },
      { content: "應徵者的線上履歷編輯器", id: nanoid(), score: 13 },
      { content: "會員系統（登入、註冊、權限管理）", id: nanoid(), score: 8 },
      {
        content: "後台職缺管理功能（資訊上架、下架、顯示應徵者資料）",
        id: nanoid(),
        score: 8,
      },
    ],
  },
  sprintList: {
    items: [],
  },
});

const [totalScoreSum, setTotalScoreSum] = useState(0);
```

這次實作了兩個 `<Droppable>` 之間互相拖曳，`onDragEnd` 之中 `splice` 要使用 `source.droppableId` 來辨別是從哪個`<Droppable>`，再組合出 `newitemObj`進行 set state，並存取`newitemObj` 之中`sprintList` item，計算分數總和

> ps: `droppableId` 也要和 `itemObj`的 key name 一致才能正確存取（ex: `droppableId` 跟 `itemObj`都要是 productBacklog 和 sprintList）

```jsx
const onDragEnd = (event) => {
  const { source, destination } = event;

  if (!destination) {
    return;
  }

  // 拷貝新的 items (來自 state)
  let newItemObj = { ...itemObj };

  // splice(start, deleteCount, item )
  // 從 source 剪下被拖曳的元素
  const [remove] = newItemObj[source.droppableId].items.splice(source.index, 1);

  // 在 destination 位置貼上被拖曳的元素
  newItemObj[destination.droppableId].items.splice(
    destination.index,
    0,
    remove
  );

  // set state 新的 itemObj
  setItemObj(newItemObj);

  // 計算 sprint 內的分數總和
  const newTotalScoreSum = newItemObj.sprintList.items.reduce(
    (acc, val) => acc + val.score,
    0
  );
  setTotalScoreSum(newTotalScoreSum);
};
```

最後 `totalScoreSum` 判斷是否大於點數上限，若大於上限則會開啟警告文字

```jsx
<WarningText>
  {totalScoreSum > 20 && "點數已超出上限，請移除一些項目"}
</WarningText>
```

## 實作 - Backlog 順序清單

<iframe src="https://codesandbox.io/embed/very-basic-react-dnd-order-detect-4ljyhv?fontsize=14&hidenavigation=1&theme=dark"
     title="very-basic-react-dnd (order detect)"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

歷經前面比較困難的部分，Backlog 順序清單就相對簡單了，這個實作是要判斷 Backlog 清單的順序是否和預設答案順序相同

差異部分是 `state` 的 `items` 改成 priority，並預設答案順序為：

1. 會員系統（登入、註冊、權限管理）
2. 應徵者的線上履歷編輯器
3. 前台職缺列表（職缺詳細內容、點選可發送應徵意願）
4. 後台職缺管理功能（資訊上架、下架、顯示應徵者資料）

```jsx
const [itemObj, setItemObj] = useState({
  candidate: {
    items: [
      {
        content: "前台職缺列表（職缺詳細內容、點選可發送應徵意願）",
        id: nanoid(),
        priority: "3",
      },
      { content: "應徵者的線上履歷編輯器", id: nanoid(), priority: "2" },
      {
        content: "會員系統（登入、註冊、權限管理）",
        id: nanoid(),
        priority: "1",
      },
      {
        content: "後台職缺管理功能（資訊上架、下架、顯示應徵者資料）",
        id: nanoid(),
        priority: "4",
      },
    ],
  },
  productBacklog: {
    items: [],
  },
});
const answerAry = ["1", "2", "3", "4"];
const [isOrderCorret, setIsOrderCorret] = useState(null);
```

差異在於 `onDragEnd` 會去確認卡片的順序是否符合答案，若相同就會顯示「順序正確」

```jsx
const onDragEnd = (event) => {
  const { source, destination } = event;

  if (!destination) {
    return;
  }

  // 拷貝新的 items (來自 state)
  let newItemObj = { ...itemObj };

  // splice(start, deleteCount, item )
  // 從 source 剪下被拖曳的元素
  const [remove] = newItemObj[source.droppableId].items.splice(source.index, 1);

  // 在 destination 位置貼上被拖曳的元素
  newItemObj[destination.droppableId].items.splice(
    destination.index,
    0,
    remove
  );

  // set state新的 itemObj
  setItemObj(newItemObj);

  // 確認 backlog 順序
  const checkProductBacklogOrder = () => {
    const currentProductBacklogOrder = newItemObj.productBacklog.items.map(
      (ele) => {
        return ele.priority;
      }
    );
    return currentProductBacklogOrder.join("") === answerAry.join("")
      ? true
      : false;
  };

  setIsOrderCorret(checkProductBacklogOrder);
};
```

稍微修改一下就可以完成這個實作囉

## 小結

因為 react-beautiful-dnd 想要為開發者保留客製化的空間，所以元件中間的 prop 需要包一個套件規定的函數，而這個函數要 return 出 react element，這些設計會使整體的結構比較複雜，一開始不好理解，建議讀者先從最簡單的結構慢慢熟悉，最後再加入樣式和更細緻的客製化

希望本此教學可以幫助你更好理解這個套件該如何上手

## Reference

[https://juejin.cn/post/6933126664608202766](https://juejin.cn/post/6933126664608202766)

[https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md)

[https://blog.laiweb.org/posts/react-beautiful-dnd.html](https://blog.laiweb.org/posts/react-beautiful-dnd.html)

[https://blog.logrocket.com/adding-drag-and-drop-functionality-with-react-beautiful-dnd/](https://blog.logrocket.com/adding-drag-and-drop-functionality-with-react-beautiful-dnd/)
