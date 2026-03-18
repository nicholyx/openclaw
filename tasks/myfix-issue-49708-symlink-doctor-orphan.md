# Fix Issue #49708: Session paths resolve through symlinks, causing false-positive doctor orphans

## Issue 概述

- **Issue 编号**: #49708
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

当用户使用符号链接（symlink）配置 openclaw home 目录时（例如 NAS/外部驱动器挂载、Docker bind mounts 或系统级符号链接），`openclaw doctor` 命令会错误地将所有会话标记为孤立（orphan）。

根本原因：

1. **存储问题**：当 gateway 创建/注册 session 时，会调用 `fs.realpathSync()` 解析符号链接，导致存储的是真实路径而非逻辑路径
2. **比较问题**：doctor 命令在进行路径比较时，没有对双方都进行规范化处理

这导致用户看到 446 个假阳性孤立会话（100% 的会话被错误标记），使得 doctor 命令完全不可靠。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49708

## 实现计划

- [ ] 理解需求（brainstorming）
- [ ] 编写测试（TDD）
- [ ] 实现修复
- [ ] 验证通过
- [ ] 代码审查

## 进度记录

- 2026-03-18: 开始处理
- 2026-03-18: 创建 worktree 和分支
