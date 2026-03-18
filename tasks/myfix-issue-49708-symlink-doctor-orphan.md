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

- [x] 理解需求（brainstorming）
- [x] 编写测试（TDD）
- [x] 实现修复
- [x] 验证通过
- [x] 代码审查

### 验证结果

- 测试: 3 个测试文件，20 个测试用例全部通过
- Lint: 0 warnings, 0 errors
- 格式检查: 通过

### Skills 使用记录

- **brainstorming**: ✅ 完成 - 深入分析了代码路径和问题根因
- **test-driven-development**: ✅ 完成 - 先写失败测试，再实现修复
- **verification-before-completion**: ✅ 完成 - 运行完整测试和 lint 验证
- **requesting-code-review**: ✅ 完成 - 代码审查通过，Ready to proceed

## 技术分析

### 根本原因

在 `doctor-state-integrity.ts` 的 orphan transcript 检测逻辑中：

1. `referencedTranscriptPaths` 来自 `resolveSessionFilePath()`，内部使用 `fs.realpathSync()` 解析符号链接
2. `orphanTranscriptPaths` 使用 `sessionsDir`（可能是符号链接路径）直接拼接，未经过 realpath 处理
3. 当 openclaw home 通过符号链接配置时，两边路径格式不一致

### 修复方案

添加 `canonicalizePath()` 辅助函数，在比较路径时对双方都进行规范化处理（使用 realpath）。

### Skills 使用记录

- **brainstorming**: ✅ 完成 - 深入分析了代码路径和问题根因
- **test-driven-development**: ✅ 完成 - 先写失败测试，再实现修复

## 进度记录

- 2026-03-18: 开始处理
- 2026-03-18: 创建 worktree 和分支
- 2026-03-18: 完成 brainstorming 分析
- 2026-03-18: 完成 TDD（测试先失败后通过）
- 2026-03-18: Lint 和类型检查通过
