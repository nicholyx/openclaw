# Fix Issue #50280: Cron: manual run stuck after job timeout — stale runningAtMs not cleared

## Issue 概述

- **Issue 编号**: #50280
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

当 cron job 超时后（例如 `Error: cron: job execution timed out`），后续通过 `cron run` 的手动运行（即使使用 `runMode: force`）会被入队但实际上永远不会启动。没有新的 cron session 启动。

### 复现步骤

1. 有一个 cron job 配置了 `timeoutSeconds: 900`
2. 让它运行并超时（job 执行时间超过 15 分钟）
3. 增加 `timeoutSeconds` 到 1800
4. 触发手动运行 — 得到 `enqueued: true` 但没有 session 启动
5. 重复尝试（包括 `runMode: force`）都入队但不执行
6. `sessions_list` with `kinds: ["cron"]` 显示 0 个 sessions
7. 只有重启 gateway 才能清除卡住的状态

### 根本原因分析

根据用户评论，超时处理器终止 session 但没有清除 cron scheduler 内存映射中的 "running" 状态。所以 scheduler 看到作业仍在运行并跳过它。

### 建议的修复方案

1. **Timeout handler 应该清除 `runningAtMs`** — 当作业因超时被终止时，清理路径应该重置 running marker，而不仅仅是终止 session。
2. **过期 marker 检测** — 在每个 cron tick 上，比较 `runningAtMs` 与作业的 `timeoutSeconds`。如果 `Date.now() - runningAtMs > timeoutSeconds * 1000 + gracePeriod`，自动清除 marker。这也处理崩溃，不仅仅是超时。
3. **`runMode: force` 应该完全绕过 running 检查** — 如果用户显式强制运行，它应该忽略过期的 marker。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/50280

## 实现计划

- [ ] 理解需求 (brainstorming)
- [ ] 探索 cron scheduler 代码结构
- [ ] 编写测试 (test-driven-development)
- [ ] 实现修复 (subagent-driven-development)
- [ ] 验证通过 (verification-before-completion)
- [ ] 代码审查 (requesting-code-review)

## 进度记录

- 2026-03-19: 开始处理，创建 worktree 和 task 文档

## Skills 使用记录

| 步骤    | Skill                          | 状态   | 结果 |
| ------- | ------------------------------ | ------ | ---- |
| 步骤 6  | brainstorming                  | 待执行 | -    |
| 步骤 7  | test-driven-development        | 待执行 | -    |
| 步骤 8  | subagent-driven-development    | 待执行 | -    |
| 步骤 9  | verification-before-completion | 待执行 | -    |
| 步骤 10 | requesting-code-review         | 待执行 | -    |
