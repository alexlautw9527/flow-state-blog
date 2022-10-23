---
title: 如何在 react-hook-form 使用UI庫元件
date: 2022-10-23
tags: [react, react-hook-form]
categories: react
toc: true
---

## 前言

一般在 react-hook-form 的範例中，通常在 native inputs 直接使用 `register` 函數所生成 props 來讓套件擁有 input 的掌控權，進一步有了表單驗證的功能

```jsx
const { onChange, onBlur, name, ref } = register('firstName');
// include type check against field path with the name you have supplied.

<input
  onChange={onChange} // assign onChange event
  onBlur={onBlur} // assign onBlur event
  name={name} // assign name prop
  ref={ref} // assign ref prop
/>
// same as above
<input {...register('firstName')} />
```

不過，如果使用 Chakra UI 或是 MUI 這些 UI 元件庫，元件都包得像是俄羅斯娃娃，直接使用 `register` 可能沒辦法讓套件這麼「深入控制」

尤其要驗證 date picker 或是 slider 這類元件的 value，就要出動 `Controller` 功能了，這次會以 MUI 作為範例

## 預備知識

- [react-hook-form 基本使用](https://react-hook-form.com/get-started)
- [MUI 基本使用](https://mui.com/material-ui/getting-started/usage/)

## `Controller` 基本架構

`control` : 從 `const { handleSubmit, control } = useForm()` 而來，傳入 `Controller` 當中讓套件

`name` : 該 input 的 unique name，如果要讓其他 input 取得其他 input 的值來驗證時，特別好用 (檢查密碼與確認密碼是否相符)

`rules` : 驗證規則，從基本的非空值到 Regex，甚至是 custom function 都可以，先詳見[官方文件](https://react-hook-form.com/api/useform/register#main)

`defaultValue` : input 預設值，不得為 `undefined`

```jsx
<form onSubmit={handleSubmit(onSubmit)}>
  <Controller
    control={control} // 讓 react-hook-form 取得掌控
    name={name} // 此 input 的 unique name
    rules={{ required: "不得為空" }} // 驗證規則
    defaultValue="" // value 預設值 不得為undefined
    // render props: 如何render
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        variant="standard"
        label="使用者名稱"
        error={!!error}
        helperText={error && error.message}
      />
    )}
  />
  <Button variant="contained" type="submit">
    送出
  </Button>
</form>
```

## `Controller` render

在 `Controller` 的 render 會傳入套件設定好的 prop 來渲染我們要用的元件，以下介紹比較重要的部分

- `field`
  - input value 的 state 跟 set State 都會由 react-hook-form 幫你做
  - `value` : 此 input 的 value state
  - `onChange` : 套件更新此 input value 的 state handler
- `fieldState`
  - 記錄這個 input 的狀態，例如是否驗證成功、是否有被觸控點擊
- `formState`
  - 整個表單的驗證狀態記錄，可詳見[官方文件](https://react-hook-form.com/api/useform/formstate#main)

```jsx
<Controller
  control={control}
  name="test"
  render={({
    field: { onChange, onBlur, value, name, ref },
    fieldState: { invalid, isTouched, isDirty, error },
    formState,
  }) => (
    // your component
  )}
/>
```

有時候不是什麼資訊都會全部用上，就會如上面的範例，只取需要的部份運用

```jsx
render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        variant="standard"
        label="使用者名稱"
        error={!!error}
        helperText={error && error.message}
      />
    )}
```

## 範例 demo

<iframe src="https://codesandbox.io/embed/nameless-wind-mjzy48?fontsize=14&hidenavigation=1&theme=dark"
     title="react-hook-form_MUI"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>
