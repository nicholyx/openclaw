# Fix Issue #49806: iMessage channel plugin fails to load: Cannot find package 'openclaw'

## Issue 概述

- **Issue 编号**: #49806
- **Issue 类型**: bug, regression
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

iMessage channel plugin 在 pnpm workspace 环境下无法加载，报错：

```
Cannot find package 'openclaw' imported from /Users/duanxiaowen/AI_Projects/moltbot/extensions/imessage/src/channel.runtime.ts
```

**根本原因**：

- commit aa3739167c ('Plugins: internalize imessage SDK imports') 修复了 `openclaw/plugin-sdk/imessage` 的导入
- 但是遗漏了 `openclaw/plugin-sdk/channel-runtime` 的导入
- `channel.runtime.ts` 第 1 行仍然使用：`import { resolveOutboundSendDep } from "openclaw/plugin-sdk/channel-runtime"`
- 这导致在 pnpm workspace 环境下无法解析 'openclaw' 包

**修复方案**：

1. 从扩展的 `runtime-api.ts` 重新导出 `resolveOutboundSendDep` 和 `OutboundSendDeps`
2. 更新 `channel.runtime.ts` 的导入，使用相对路径 `../runtime-api.js` 而不是包导入

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49806
- 相关 commit: aa3739167c

## 实现计划

- [x] 理解需求
- [x] 编写测试
- [x] 实现修复
- [x] 验证通过
- [ ] 代码审查

## 进度记录

- 2026-03-18 21:21: 开始处理，创建 worktree 和分支
- 2026-03-18 21:22: 理解 issue 根本原因和修复方案
- 2026-03-18 21:25: 编写测试（TDD RED 阶段） - 测试失败，符合预期
- 2026-03-18 21:27: 实现修复（TDD GREEN 阶段） - 测试通过，修复完成
  - 修改 `extensions/imessage/runtime-api.ts`：添加 `resolveOutboundSendDep` 和 `OutboundSendDeps` 的重新导出
  - 修改 `extensions/imessage/src/channel.runtime.ts`：将导入从 `openclaw/plugin-sdk/channel-runtime` 改为相对路径 `../runtime-api.js`
  - 创建测试文件 `extensions/imessage/src/imports.test.ts`：验证导入正确性
- 2026-03-18 21:28: TypeScript 编译通过
- 2026-03-18 21:30: 验证完成（所有测试通过，lint 通过，构建成功）
