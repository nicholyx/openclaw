# Fix Issue #49613: Non-default agents do not inherit agents.defaults.heartbeat

## Issue 概述

- **Issue 编号**: #49613
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

`agents.defaults.heartbeat` merges heartbeat values for non-default agents, but it does not enable heartbeat for them unless they also define `agents.list[].heartbeat`.

### 问题根源

当前运行时逻辑检查心跳启用的方式：

```typescript
// src/infra/heartbeat-runner.ts
if (hasExplicitHeartbeatAgents(cfg)) {
  return list.some(
    (entry) => Boolean(entry?.heartbeat) && normalizeAgentId(entry?.id) === resolvedAgentId,
  );
}
return resolvedAgentId === resolveDefaultAgentId(cfg);
```

### 期望行为

当配置了 `agents.defaults.heartbeat` 时，所有配置的代理都应该继承心跳启用，除非特定代理覆盖了心跳字段。

### 实际行为

非默认代理不会运行心跳，除非它显式定义了 `agents.list[].heartbeat`，即使心跳值仍然从 `agents.defaults.heartbeat` 合并。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49613

## 实现计划

- [x] 理解需求（brainstorming）
- [x] 编写测试（TDD）
- [x] 实现修复
- [x] 验证通过
- [x] 代码审查
- [x] 文档改进

## 进度记录

- 2026-03-18: 开始处理，创建 worktree 和分支
- 2026-03-18: 使用 brainstorming skill 深入理解需求

## 技术细节

### 影响范围

- 受影响：多代理部署，将聊天/频道路由到非默认代理
- 严重性：中等到高
- 频率：确定性 / 100% 可复现
- 后果：基于心跳的进度、回调和后续交付静默不运行

### 修复方案

需要修改 `src/infra/heartbeat-runner.ts` 中的心跳启用检查逻辑，使非默认代理也能从 `agents.defaults.heartbeat` 继承心跳启用状态。

### 测试用例

回归测试命令：

```bash
pnpm test -- src/infra/heartbeat-runner.returns-default-unset.test.ts src/commands/health.snapshot.test.ts
```

## Skills 使用记录

- [x] using-git-worktrees: 创建隔离的工作环境
- [x] brainstorming: 深入理解需求（已完成，采用方案 A）
  - **完成结果**: 分析了问题根源，提出了两种方案，推荐方案 A（默认启用 + 显式选择退出）
  - **方案 A 核心逻辑**: 如果配置了 `agents.defaults.heartbeat`，所有代理都启用心跳
  - **优势**: 符合用户直觉、最小化代码改动、向后兼容
- [x] test-driven-development: 编写测试
  - **RED 阶段**: 编写了 4 个测试用例，验证期望的行为
  - **GREEN 阶段**: 实现了最小代码修复，所有测试通过
  - **测试结果**: 28 个测试全部通过（包含新增的退出行为测试）
- [x] verification-before-completion: 验证
  - **测试验证**: 所有 28 个测试通过
  - **代码检查**: `pnpm check` 全部通过
  - **构建验证**: `pnpm build` 成功
  - **修改文件**: 2 个文件（核心逻辑、测试）
- [x] requesting-code-review: 代码审查
  - **审查结果**: APPROVED（批准合并）
  - **审查反馈**: 实现正确，测试充分，向后兼容
  - **改进措施**: 添加了退出行为的文档和测试，澄清了设计限制
  - **审查 agent**: superpowers:code-reviewer

## 最终状态

- **状态**: ✅ 完成
- **提交**: 2 个功能提交 + 1 个文档改进提交
- **测试**: 28/28 通过
- **审查**: APPROVED
- **已推送**: origin/myfix/issue-49613-heartbeat-inheritance
