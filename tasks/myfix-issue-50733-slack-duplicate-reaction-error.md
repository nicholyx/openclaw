# Fix Issue #50733: Occasional errors printed in Slack due when attempting to add/readd duplicate reactions

## Issue 概述

- **Issue 编号**: #50733
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

当 agent（或 OpenClaw 的 ack-reaction 管道）尝试向消息添加已经存在的 Slack reaction 时，Slack API 返回 `already_reacted` 错误。这会在 agent 的输出中显示为可见的错误：

```
:warning: :email: Message: `message 1773966550.270379, emoji eyes` failed
```

### 期望行为

重复的 reactions 应该被视为无操作并静默忽略。

### 实际行为

Slack API 返回 `already_reacted` 错误，导致错误消息显示在输出中。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/50733
- 之前的 PR: https://github.com/openclaw/openclaw/pull/9520

## 实现计划

- [x] 理解需求
- [ ] 编写测试
- [ ] 实现修复
- [ ] 验证通过
- [ ] 代码审查

## 技术方案

### 修改位置

`src/slack/actions.ts` — `reactSlackMessage` 函数

### 实现方式

捕获 Slack API 错误并在错误代码为 `already_reacted` 时抑制它：

```typescript
async function reactSlackMessage(channelId, messageId, emoji, opts = {}) {
  try {
    await (
      await getClient(opts)
    ).reactions.add({
      channel: channelId,
      timestamp: messageId,
      name: normalizeEmoji(emoji),
    });
  } catch (err) {
    // Slack returns `already_reacted` when the bot already has this
    // reaction on the message. The desired state is achieved — swallow it.
    if (isSlackApiError(err, "already_reacted")) return;
    throw err;
  }
}
```

同样需要处理 `removeSlackReaction` 中的 `no_reaction` 错误。

## 进度记录

- 2026-03-20: 开始处理，创建 worktree 和 task 文档
