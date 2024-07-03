# Danbooru词条自动补全与全局提示检索

---

提供词库导入，词条自动补全，全局提示检索；同时支持多种随机Prompt构造模式【需生成端支持】

## 特性

支持词库导入展示，全词条补全，prompt构造解析，异常构造提示，无效prompt提示

## 词库构造

词库需传入json文件，词库格式如下：
```json
[
  {
    "n": "<tag名>",
    "z": "<tag中文名，可为空>",
    "w": "<tag的Wiki，支持markdown格式，自动显示在右侧，可为空>",
    "o": "别名：`<别名1>`、`<别名2>`...",
    "c": ["<分类名1>","<分类名2>"],
    "r": 0 // 压缩的信息数字，压缩方式为 r=post_count*16 + (is_deleted? 8 : 0) + category(0=general 1=artist 3=copyright 4=character)
  },
  // ...
]
```

**Enjoy!**
