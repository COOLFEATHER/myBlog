---
id: 2
title: "Vue 3 响应式原理深度解析"
date: 2024-03-05
category: "前端开发"
tags: ["Vue", "JavaScript"]
summary: "Vue 3 使用 Proxy 替代了 Object.defineProperty，带来了更强大、更高效的响应式系统。本文带你深入源码理解其核心原理。"
cover: ""
readCount: 256
likeCount: 78
collectCount: 41
---
## 从 Object.defineProperty 到 Proxy

Vue 2 使用 `Object.defineProperty` 实现响应式，但存在缺陷：无法检测数组下标变化、需递归遍历、无法监听新增属性。

Vue 3 使用 ES6 Proxy 彻底解决了这些问题。

```javascript
const reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      trigger(target, key);
      return result;
    }
  });
};
```

## reactive 与 ref

- `reactive`：深度响应式，适用于对象
- `ref`：适用于基本类型，通过 `.value` 访问

## 依赖追踪机制

Vue 3 使用 `targetMap` 存储依赖关系，实现精准更新。

只有使用到的属性变化时，才会触发重新渲染。