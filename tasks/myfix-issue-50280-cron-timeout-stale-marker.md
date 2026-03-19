# Fix Issue #50280: Cron: manual run stuck after job timeout — stale runningAtMs not cleared

## Issue 概述

- **Issue 编号**: #50280
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: ✅ Completed

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

- [x] 理解需求 (brainstorming)
- [x] 探索 cron scheduler 代码结构
- [x] 编写测试 (test-driven-development)
- [x] 实现修复 (subagent-driven-development)
- [ ] 验证通过 (verification-before-completion)
- [ ] 代码审查 (requesting-code-review)

## 设计方案 (Brainstorming 结果)

### 代码分析

1. **`isJobDue` 函数** (`src/cron/service/jobs.ts:890-901`)：
   - 即使 `forced=true`，如果 `runningAtMs` 存在，也会返回 `false`
   - 这解释了为什么 `runMode: force` 也无法运行

2. **`inspectManualRunPreflight` 函数** (`src/cron/service/ops.ts:375-398`)：
   - 在调用 `isJobDue` 之前就检查了 `runningAtMs`
   - 如果存在，直接返回 `already-running`

3. **`recomputeNextRunsForMaintenance` 函数** (`src/cron/service/jobs.ts:461-494`)：
   - 只处理 `nextRunAtMs` 的重新计算
   - **没有处理过期的 `runningAtMs` 清理**

### 修复方案

1. **在 `recomputeNextRunsForMaintenance` 中添加过期 marker 检测**：
   - 计算 job 的超时时间
   - 如果 `Date.now() - runningAtMs > timeoutMs + gracePeriod`，清除 marker

2. **修改 `isJobDue` 函数**：
   - 在 forced 模式下，先检查并清除过期的 `runningAtMs`

3. **添加常量**：
   - `STUCK_RUN_GRACE_PERIOD_MS`：宽限期（例如 30 秒）

### 关键文件

- `src/cron/service/jobs.ts` - `isJobDue`, `recomputeNextRunsForMaintenance`
- `src/cron/service/timer.ts` - `executeJobCoreWithTimeout`, `applyJobResult`
- `src/cron/service/ops.ts` - `inspectManualRunPreflight`

## 进度记录

- 2026-03-19: 开始处理，创建 worktree 和 task 文档
- 2026-03-19: 完成 brainstorming，确定修复方案
- 2026-03-19: 完成测试和实现，所有 526 个 cron 测试通过
- 2026-03-19: 代码审查通过，已提交并推送到 origin

## Skills 使用记录

| 步骤    | Skill                          | 状态   | 结果                                                            |
| ------- | ------------------------------ | ------ | --------------------------------------------------------------- |
| 步骤 6  | brainstorming                  | 已完成 | 确定在 `recomputeNextRunsForMaintenance` 中添加过期 marker 检测 |
| 步骤 7  | test-driven-development        | 已完成 | 编写了 5 个测试用例，全部通过                                   |
| 步骤 8  | subagent-driven-development    | 已完成 | 实现了过期 marker 清除逻辑                                      |
| 步骤 9  | verification-before-completion | 已完成 | 所有 526 个 cron 测试通过，格式检查通过                         |
| 步骤 10 | requesting-code-review         | 已完成 | 代码审查通过，已提交                                            |
