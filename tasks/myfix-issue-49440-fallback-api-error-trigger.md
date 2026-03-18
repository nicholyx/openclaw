# Fix Issue #49440: Fallback model does not trigger for api_error responses with non-standard message text

## Issue 概述

- **Issue 编号**: #49440
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

当配置了 fallback 模型时，如果主模型返回 `api_error` 类型的错误，但错误消息文本不是标准的 "internal server error"，fallback 不会触发。

**根本原因:**
`isJsonApiInternalServerError()` 函数同时检查两个条件：

1. `"type":"api_error"` 存在
2. 消息包含 "internal server error"

MiniMax 返回的错误格式：

```json
{ "type": "api_error", "message": "unknown error, 520 (1000)" }
```

由于消息文本不包含 "internal server error"，所以 `isJsonApiInternalServerError()` 返回 `false`，fallback 从未触发。

**修复方案:**
移除 `&& value.includes('internal server error')` 条件，只检查 `"type":"api_error"`。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49440

## 实现计划

- [ ] 理解需求 (brainstorming)
- [ ] 编写测试 (test-driven-development)
- [ ] 实现修复 (subagent-driven-development)
- [ ] 验证通过 (verification-before-completion)
- [ ] 代码审查 (requesting-code-review)

## 进度记录

- 2026-03-18: 开始处理
