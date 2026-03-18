# Fix Issue #49498: Dockerfile: WhatsApp extension fails — missing src/ and apps/ in runtime image

## Issue 概述

- **Issue 编号**: #49498
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: Completed

## 问题描述

Dockerfile 的 runtime stage 缺少 COPY src/ 和 apps/ 指令，导致 WhatsApp extension 在 Docker 中无法运行。

**错误信息：**

```
Cannot find module '../../../src/channels/plugins/account-helpers.js'
Cannot find module '../../apps/shared/OpenClawKit/Sources/OpenClawKit/Resources/tool-display.json'
```

**根因分析：**

- Dockerfile 的多阶段构建模式：
  1. 在 build stage 构建所有内容
  2. 复制 `dist/` 和 `extensions/` 到 runtime stage
  3. 但跳过了 `src/` 和 `apps/` —— 而 WhatsApp extension 通过相对路径在运行时引用这些目录

**解决方案：**
在 Dockerfile 中添加两个 COPY 指令：

```dockerfile
COPY --from=runtime-assets --chown=node:node /app/src ./src
COPY --from=runtime-assets --chown=node:node /app/apps ./apps
```

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49498

## 实现计划

- [x] 理解需求
- [x] 实现修复
- [ ] 验证通过
- [ ] 代码审查

## 修复内容

在 `Dockerfile` 的 runtime stage 添加了两个 COPY 挽回指令：

```dockerfile
# Copy src/ and apps/ for runtime use by extensions (e.g., WhatsApp extension)
COPY --from=runtime-assets --chown=node:node /app/src ./src
COPY --from=runtime-assets --chown=node:node /app/apps ./apps
```

**修复原因：**

1. WhatsApp extension 通过相对路径引用 `src/channels/plugins/account-helpers.js`
2. WhatsApp extension 通过相对路径引用 `apps/shared/OpenClawKit/Sources/OpenClawKit/Resources/tool-display.json`
3. Dockerfile 的 runtime stage 原本缺少这两个目录，导致 runtime image 中无法找到这些文件
4. 没有 src/ 和 apps/ 目录，extension 无法正常运行

## 进度记录

- 2026-03-18: 开始处理
- 2026-03-18: 创建 worktree 和分支
- 2026-03-18: 创建 task 文档
- 2026-03-18: 实现修复（添加 COPY src/ 和 apps/ 指令）
- 2026-03-18: 代码已推送到 origin，- **下一步**: 用户线下确认后手动提交 PR 到
