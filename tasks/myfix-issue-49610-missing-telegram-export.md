# Fix Issue #49610: `createForumTopicTelegram` Export Missing in runtime-api.ts

## Issue 概述

- **Issue 编号**: #49610
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

When running OpenClaw with Docker setup（./docker-setup.sh）, the gateway container fails to start due to a missing export in the Telegram plugin runtime API.

Error Message:

```
SyntaxError: Export 'createForumTopicTelegram' is not defined in module
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    ...
```

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49610

## 实现计划

- [x] 理解需求
- [x] 发现问题已在最新 commit 中修复
- [x] 验证修复

## 进度记录

- 2026-03-18: 开始处理
- 2026-03-18: 发现问题已在 commit fbd88e2c8f 中修复

## 发现说明

经过深入分析，发现此 issue 已在最新的 commit `fbd88e2c8f` (Main recovery: restore formatter and contract checks (#49570)) 中修复：

- 修复内容：在 `extensions/telegram/runtime-api.ts` 第 59 行添加了 `createForumTopicTelegram` 的导出
- `createForumTopicTelegram` 现在已从 `./src/send.js` 正确导出，并可被 `src/plugin-sdk/telegram.ts` 导入
