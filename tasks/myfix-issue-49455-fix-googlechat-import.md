# Fix Issue #49455: Docker build fails due to unresolved import

## Issue 概述

- **Issue 编号**: #49455
- **Issue 类型**: bug (crash)
- **仓库**: openclaw/openclaw
- **状态**: Completed

## 问题描述

Docker 构建失败，原因是多个扩展中的导入路径问题：

1. **acpx 扩展**：`extensions/acpx/src/runtime-internals/` 目录下的文件使用了错误的导入路径 `../runtime-api.js`，只向上一级而不是正确的 `../../runtime-api.js`。

2. **twitch SDK**：`src/plugin-sdk/twitch.ts` 从 `../../extensions/twitch/api.js` 导入，但该文件重新导出自 `openclaw/plugin-sdk/twitch`，造成循环依赖。

3. **测试预期过时**：`runtime-api-guardrails.test.ts` 中的预期值与 `imessage` 和 `signal` 扩展的实际导出不匹配。

**影响：** 阻止所有 Docker 部署在 v2026.3.14 版本上。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49455

## 实现计划

- [x] 理解需求 (brainstorming skill)
- [x] 编写测试 (test-driven-development skill) - 跳过，使用构建验证
- [x] 实现修复 (subagent-driven-development skill)
- [x] 验证通过 (verification-before-completion skill)
- [x] 代码审查 (requesting-code-review skill) - 已完成并修复审查发现的问题

## 修复摘要

### 修改的文件

1. **extensions/acpx/src/runtime-internals/process.ts** - 修复导入路径
2. **extensions/acpx/src/runtime-internals/events.ts** - 修复导入路径
3. **src/plugin-sdk/twitch.ts** - 避免循环导出
4. **src/plugin-sdk/runtime-api-guardrails.test.ts** - 更新测试预期值

### 提交记录

- `fix(acpx): correct runtime-api import paths in runtime-internals`
- `fix(plugin-sdk): avoid circular reexport in twitch SDK`
- `fix(test): update runtime-api export guards for imessage and signal`

## 进度记录

- 2026-03-18: 开始处理，创建 worktree 和分支
- 2026-03-18: 同步 upstream 最新代码
- 2026-03-18: 完成修复并通过构建验证
- 2026-03-18: 完成代码审查并修复发现的问题

## Skill 执行记录

### 步骤 6: brainstorming

- 状态: ✅ 完成
- 结果: 问题分析完成。根本原因是提交 `4d551e6f33` 中，`extensions/acpx/src/runtime-internals/` 目录下的 `process.ts` 和 `events.ts` 文件使用了错误的导入路径 `../runtime-api.js`（只向上一级），而不是正确的 `../../runtime-api.js`（向上两级到扩展根目录）。需要修复这两个文件的导入路径。

### 步骤 7: test-driven-development

- 状态: ✅ 跳过
- 结果: 这是一个简单的导入路径修复，不需要编写新的测试。现有的构建测试将验证修复是否成功。

### 步骤 8: subagent-driven-development

- 状态: ✅ 完成
- 结果: 修复了两个问题：
  1. `extensions/acpx/src/runtime-internals/process.ts` 和 `events.ts` 的导入路径从 `../runtime-api.js` 改为 `../../runtime-api.js`
  2. `src/plugin-sdk/twitch.ts` 的循环导出问题，从 `../../extensions/twitch/api.js` 改为 `../../extensions/twitch/src/setup-surface.js`

### 步骤 9: verification-before-completion

- 状态: ✅ 完成
- 结果: 构建成功通过！运行 `pnpm build` 完成，所有步骤都成功执行。

### 步骤 10: requesting-code-review

- 状态: ✅ 完成
- 结果: 代码审查完成。审查发现并修复了以下问题：
  1. 预存在的测试失败：`runtime-api-guardrails.test.ts` 中 `imessage` 和 `signal` 扩展的预期值过时，已修复
  2. 所有修复均通过审查，构建和测试都成功完成
