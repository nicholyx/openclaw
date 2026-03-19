# Fix Issue #50074: Gateway restart fails - stale process misdetection

## Issue 概述

- **Issue 编号**: #50074
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

Gateway restart fails - stale process misdetection

在 Windows 平台上，`findGatewayPidsOnPortSync` 函数直接返回空数组，导致无法检测到占用端口的旧 Gateway 进程。这会导致：

1. CLI 无法检测到占用端口 18789 的旧 Gateway 进程
2. 尝试启动新的 Gateway → 端口已被占用 → 失败
3. 或者检测到"陈旧进程"但无法正确清理

### 根本原因

文件: `src/infra/restart-stale-pids.ts`

```typescript
export function findGatewayPidsOnPortSync(
  port: number,
  spawnTimeoutMs = SPAWN_TIMEOUT_MS,
): number[] {
  if (process.platform === "win32") {
    return []; // ← BUG: Windows 返回空数组！
  }
  // ... Linux/Mac 代码使用 lsof 检测端口占用
}
```

### 修复方案

在 Windows 上使用 `netstat` 替代 `lsof` 来检测端口占用：

```typescript
if (process.platform === "win32") {
  const res = spawnSync("netstat", ["-ano"], {
    encoding: "utf8",
    timeout: spawnTimeoutMs,
  });

  if (res.error || res.status !== 0) {
    return [];
  }

  const pids: number[] = [];
  const lines = res.stdout.split(/\r?\n/);
  const portStr = `:${port}`;

  for (const line of lines) {
    if (line.includes(portStr) && line.includes("LISTENING")) {
      const parts = line.trim().split(/\s+/);
      const pid = parseInt(parts[parts.length - 1], 10);
      if (Number.isFinite(pid) && pid > 0) {
        pids.push(pid);
      }
    }
  }

  return [...new Set(pids)].filter((pid) => pid !== process.pid);
}
```

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/50074

## 实现计划

- [ ] 理解需求 - brainstorming skill
- [ ] 编写测试 - test-driven-development skill
- [ ] 实现修复 - subagent-driven-development skill
- [ ] 验证通过 - verification-before-completion skill
- [ ] 代码审查 - requesting-code-review skill

## 进度记录

- 2026-03-19: 开始处理
- 2026-03-19: 创建 worktree 和分支
- 2026-03-19: 创建 task 文档

## Skill 使用记录

| 步骤     | Skill                          | 是否使用 | 完成结果 |
| -------- | ------------------------------ | -------- | -------- |
| 理解需求 | brainstorming                  | 待执行   | -        |
| 编写测试 | test-driven-development        | 待执行   | -        |
| 实现修复 | subagent-driven-development    | 待执行   | -        |
| 验证通过 | verification-before-completion | 待执行   | -        |
| 代码审查 | requesting-code-review         | 待执行   | -        |
