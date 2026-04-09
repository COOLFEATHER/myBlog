---
id: 6
title: "TypeScript 泛型完全指南：从入门到精通"
date: 2024-03-14
category: "前端开发"
tags: ["TypeScript", "JavaScript"]
summary: "泛型是 TypeScript 最强大的特性之一。本文覆盖泛型基础、约束、泛型工具类以及在实际项目中的最佳实践。"
cover: ""
readCount: 145
likeCount: 48
collectCount: 27
---
## 为什么需要泛型？

在没有泛型的情况下，函数参数和返回值类型只能写死，失去了类型检查的意义。

```typescript
// 没有泛型：类型丢失
function identity(arg: any): any {
  return arg;
}

// 使用泛型：保留类型信息
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("hello"); // result 被推断为 string
```

## 泛型约束

限制泛型必须包含特定属性：

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
```

## 内置泛型工具类型

- `Partial<T>` — 所有属性变为可选
- `Required<T>` — 所有属性变为必需
- `Pick<T, K>` — 选取部分属性
- `Omit<T, K>` — 排除部分属性
- `Record<K, V>` — 构建键值对对象
- `ReturnType<F>` — 获取函数返回值类型

## 泛型类

```typescript
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
```