---
id: 4
title: "Python 数据分析入门：用 Pandas 处理真实数据集"
date: 2024-03-10
category: "数据分析"
tags: ["Python"]
summary: "从安装配置到数据清洗、可视化，通过一个真实的数据分析案例，带你入门 Python 数据分析全流程。"
cover: ""
readCount: 167
likeCount: 55
collectCount: 38
---
## 环境准备

```bash
pip install pandas numpy matplotlib seaborn jupyter
```

## 数据加载与探索

```python
import pandas as pd

df = pd.read_csv('data.csv')
print(df.head())
print(df.info())
print(df.describe())
```

## 数据清洗

常见操作：
- 缺失值处理：`df.fillna(0)` 或 `df.dropna()`
- 类型转换：`df['date'] = pd.to_datetime(df['date'])`
- 去重：`df.drop_duplicates()`
- 异常值过滤

## 数据可视化

```python
import matplotlib.pyplot as plt

df.groupby('category')['sales'].sum().plot(kind='bar')
plt.title('Sales by Category')
plt.show()
```

## 实战案例

对某电商平台 10 万条订单数据进行分析，发现退货率与客单价的负相关性，并给出优化建议。