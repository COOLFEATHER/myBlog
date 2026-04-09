---
id: 1
title: "深入理解 JavaScript 闭包"
date: 2024-03-01
category: "前端开发"
tags: ["JavaScript", "TypeScript"]
summary: "闭包是 JavaScript 中最强大的特性之一。本文将从执行上下文、作用域链的角度，深入剖析闭包的形成原理与实际应用场景。"
cover: ""
readCount: 129
likeCount: 45
collectCount: 23
---
## 什么是闭包？

闭包是指一个函数能够访问其词法作用域外部的变量。简单来说，就是函数嵌套函数，内部函数引用外部函数的变量。

```javascript
function outer() {
  const a = 10;
  function inner() {
    console.log(a); // 内部函数访问了外部变量
  }
  return inner;
}

const fn = outer();
fn(); // 10
```

## 闭包的应用场景

### 1. 数据私有化
```javascript
function counter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}
```

### 2. 函数柯里化
```javascript
function currying(fn) {
  return function(a) {
    return function(b) {
      return fn(a, b);
    };
  };
}
```

## 闭包的内存问题

闭包会导致内存泄漏，因为被闭包引用的变量无法被垃圾回收。在不需要时应及时释放引用。

> 理解闭包，是深入 JavaScript 的必经之路。