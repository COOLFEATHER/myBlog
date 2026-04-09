---
id: 5
title: "Git 高级用法：让你的提交历史井井有条"
date: 2024-03-12
category: "开发工具"
tags: ["Git"]
summary: "rebase、cherry-pick、stash、reflog……这些高级命令让你的 Git 工作流更加高效和规范。"
cover: ""
readCount: 203
likeCount: 67
collectCount: 29
---
## 交互式 Rebase 整理提交

```bash
git rebase -i HEAD~3
```

可以在交互界面中：
- `pick` 保留提交
- `squash` 合并到上一个提交
- `reword` 修改提交信息
- `drop` 删除提交

## Cherry-pick 精准选取

将特定提交应用到当前分支：

```bash
git cherry-pick <commit-hash>
```

## Stash 暂存修改

```bash
git stash save "工作进度"
git stash list
git stash pop  # 恢复并删除
```

## Reflog 恢复误删

```bash
git reflog
git checkout HEAD@{2}
```

## 最佳实践

1. 保持提交原子化，一个提交做一件事
2. 合理使用分支模型
3. 提交信息要有意义
4. 合并前先拉取最新代码