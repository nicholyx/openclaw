# Fix Issue #49455: Docker build fails due to unresolved import channel-policy.js in Google Chat extension

## Issue 概述

- **Issue 编号**: #49455
- **Issue 类型**: bug (crash)
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

Docker 构建失败，原因是 `extensions/acpx/src/runtime-internals/` 目录下的文件使用了错误的导入路径。

**错误信息：**

```
[UNRESOLVED_IMPORT] Could not resolve '../runtime-api.js' in extensions/acpx/src/runtime-internals/process.ts
```

**根本原因：**

在提交 `4d551e6f33` ("Plugins: internalize acpx SDK imports") 中，创建了 `extensions/acpx/runtime-api.ts` 文件，并将导入路径从 `openclaw/plugin-sdk/acpx` 改为 `../runtime-api.js`。

但是，对于 `extensions/acpx/src/runtime-internals/` 目录下的文件，错误的导入路径 `../runtime-api.js` 只向上跳了一级，指向了不存在的 `extensions/acpx/src/runtime-api.js`，而不是正确的 `../../runtime-api.js`（指向扩展根目录）。

**影响：** 阻止所有 Docker 部署在 v2026.3.14 版本上。任何尝试从源代码构建容器化 OpenClaw 的用户都会被完全阻塞。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49455

## 实现计划

- [x] 理解需求 (brainstorming skill)
- [x] 编写测试 (test-driven-development skill) - 跳过，使用构建验证
- [x] 实现修复 (subagent-driven-development skill)
- [x] 验证通过 (verification-before-completion skill)
- [ ] 代码审查 (requesting-code-review skill)

## 进度记录

- 2026-03-18: 开始处理，创建 worktree 和分支
- 2026-03-18: 同步 upstream 最新代码

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

- 状态: 待执行
- 结果: 待记录
