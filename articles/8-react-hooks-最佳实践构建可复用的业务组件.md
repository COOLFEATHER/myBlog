---
id: 8
title: "React Hooks 最佳实践：构建可复用的业务组件"
date: 2024-03-18
category: "前端开发"
tags: ["React", "JavaScript", "TypeScript"]
summary: "结合实际业务场景，分享 useState、useEffect、useCallback、useMemo、useRef 的最佳实践，以及如何设计自定义 Hook。"
cover: ""
readCount: 202
likeCount: 63
collectCount: 35
---
## useState 最佳实践

```javascript
// 避免对象状态过度拆分
const [form, setForm] = useState({ name: '', email: '' });

// 正确更新嵌套对象
setForm(prev => ({ ...prev, email: 'new@example.com' }));
```

## useEffect 清理函数

```javascript
useEffect(() => {
  const subscription = subscribe(id, handler);
  return () => subscription.unsubscribe(); // 清理
}, [id]);
```

## useCallback vs useMemo

- `useCallback`：缓存函数引用，避免子组件不必要重渲染
- `useMemo`：缓存计算结果，避免重复计算

## 自定义 Hook 示例

```javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

## 项目级 Hook 架构

建议在 `src/hooks/` 目录下：
- `useAsync.js` — 处理异步请求状态
- `usePagination.js` — 分页逻辑
- `useForm.js` — 表单处理