# Fix Issue #49440: Fallback model does not trigger for api_error responses with non-standard message text

## Issue 概述

- **Issue 编号**: #49440
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: Completed

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

- [x] 理解需求 (brainstorming) ✅ 已完成
- [x] 编写测试 (test-driven-development) ✅ 已完成
- [x] 实现修复 (subagent-driven-development) ✅ 已完成 (直接修复)
- [x] 验证通过 (verification-before-completion) ✅ 已完成
- [x] 代码审查 (requesting-code-review) ✅ 已完成 - APPROVED

## 进度记录

- 2026-03-18: 开始处理
- 2026-03-18: **Brainstorming 完成** - 分析了 `isJsonApiInternalServerError()` 函数在 `src/agents/pi-embedded-helpers/errors.ts:851-859`，确认根本原因是同时检查两个条件导致 MiniMax 等非标准错误被忽略。
- 2026-03-18: **TDD 完成** - 添加了 3 个新测试用例验证修复：
  - `classifies JSON api_error with non-standard message as timeout (MiniMax 520)`
  - `classifies JSON api_error with any message as timeout`
  - 所有 73 个测试通过
- 2026-03-18: **实现完成** - 修改 `isJsonApiInternalServerError()` 函数，移除 `&& value.includes("internal server error")` 条件，只检查 `"type":"api_error"` 是否存在。
- 2026-03-18: **验证完成** - 73/73 测试通过，lint 0 错误
- 2026-03-18: **代码审查通过** - 审查结果: APPROVED，修复正确、安全、测试充分

## 修改文件

1. `src/agents/pi-embedded-helpers/errors.ts` - 修改 `isJsonApiInternalServerError()` 函数
2. `src/agents/pi-embedded-helpers.isbillingerrormessage.test.ts` - 添加测试用例
