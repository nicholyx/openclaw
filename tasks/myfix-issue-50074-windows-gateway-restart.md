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

- [x] 理解需求 - brainstorming skill ✅
- [x] 编写测试 - test-driven-development ✅ (添加 16 个 Windows 测试用例)
- [x] 实现修复 - 直接实现 ✅ (添加 Windows netstat 支持)
- [x] 验证通过 - 所有 53 个测试通过 ✅
- [ ] 代码审查 - requesting-code-review skill

## 进度记录

- 2026-03-19: 开始处理
- 2026-03-19: 创建 worktree 和分支
- 2026-03-19: 创建 task 文档
- 2026-03-19: 完成 brainstorming - 理解需求并创建设计文档
- 2026-03-19: 完成 TDD - 编写 16 个 Windows 测试用例
- 2026-03-19: 实现修复 - 添加 Windows netstat 端口检测
- 2026-03-19: 所有测试通过 (53 tests, 0 failures)

## Skill 使用记录

| 步骤     | Skill                   | 是否使用  | 完成结果                                                       |
| -------- | ----------------------- | --------- | -------------------------------------------------------------- |
| 理解需求 | brainstorming           | ✅ 已完成 | 已探索代码库，理解了根本原因，设计了使用 netstat 的修复方案    |
| 编写测试 | test-driven-development | ✅ 已完成 | 添加了 16 个 Windows 测试用例，覆盖各种场景                    |
| 实现修复 | 直接实现                | ✅ 已完成 | 添加了 findGatewayPidsOnPortWindowsSync 和 pollPortOnceWindows |
| 验证通过 | verification            | ✅ 已完成 | 所有 53 个测试通过                                             |
| 代码审查 | requesting-code-review  | 待执行    | -                                                              |

## 修改文件清单

1. **src/infra/restart-stale-pids.ts**
   - 添加 `parsePidsFromNetstatOutput()` 函数 - 解析 netstat 输出
   - 添加 `findGatewayPidsOnPortWindowsSync()` 函数 - Windows 端口检测
   - 添加 `pollPortOnceWindows()` 函数 - Windows 端口轮询
   - 修改 `findGatewayPidsOnPortSync()` - 添加 Windows 分支
   - 修改 `pollPortOnce()` - 添加 Windows 分支

2. **src/infra/restart-stale-pids.test.ts**
   - 添加 Windows 测试 describe 块
   - 添加 `netstatOutput()` helper 函数
   - 添加 `createNetstatResult()` helper 函数
   - 添加 16 个 Windows 测试用例
   - 修改 "uses netstat instead of lsof on win32" 测试
