# Fix Issue #50227: write tool ~ path expansion resolves to wrong path causing EACCES

## Issue 概述

- **Issue 编号**: #50227
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

The `write` tool fails with `EACCES: permission denied, mkdir /home/vela/` when attempting to write to a path using `~` expansion.

### 根本原因

- `exec` tool correctly expands `~` to `/home/vela/`
- `write` tool attempts to create literal path `/home/vela/` (creating a directory called `vela` inside `/home/`)
- But the actual home is `/home/vela/`, not `/home/vela/`

### 修复方向

```ts
function expandTilde(p: string): string {
  if (p.startsWith("~/") || p === "~") {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}
```

Apply this at the top of the `write` tool's path resolution before any `mkdirSync` or `writeFileSync` call. The `exec` tool already does this correctly (likely via shell expansion) — the `write` tool needs the same treatment.

**Affected paths:** any path starting with `~` passed to `write`, `read`, `edit` tools.

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/50227

## 实现计划

- [x] 理解需求
- [ ] 编写测试
- [ ] 实现修复
- [ ] 验证通过
- [ ] 代码审查

## 进度记录

- 2026-03-19: 开始处理，已创建 worktree 和分支
- 2026-03-19: 使用 using-git-worktrees skill 完成
