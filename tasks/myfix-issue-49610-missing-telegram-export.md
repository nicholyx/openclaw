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
- [ ] 编写测试
- [ ] 实现修复
- [ ] 验证通过
- [ ] 代码审查

## 进度记录

- 2026-03-18: 开始处理
