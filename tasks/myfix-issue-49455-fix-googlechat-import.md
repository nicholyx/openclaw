# Fix Issue #49455: Docker build fails due to unresolved import channel-policy.js in Google Chat extension

## Issue 概述

- **Issue 编号**: #49455
- **Issue 类型**: bug (crash)
- **仓库**: openclaw/openclaw
- **状态**: In Progress

## 问题描述

Docker 构建失败，原因是 Google Chat 扩展中的 `extensions/googlechat/runtime-api.ts` 导入了不存在的文件 `../../src/channels/channel-policy.js`。

**错误信息：**

```
[UNRESOLVED_IMPORT] Could not resolve '../../src/channels/channel-policy.js'
```

**影响：** 阻止所有 Docker 部署在 v2026.3.14 版本上。任何尝试从源代码构建容器化 OpenClaw 的用户都会被完全阻塞。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49455

## 实现计划

- [x] 理解需求 (brainstorming skill)
- [ ] 编写测试 (test-driven-development skill)
- [ ] 实现修复 (subagent-driven-development skill)
- [ ] 验证通过 (verification-before-completion skill)
- [ ] 代码审查 (requesting-code-review skill)

## 进度记录

- 2026-03-18: 开始处理，创建 worktree 和分支
- 2026-03-18: 同步 upstream 最新代码

## Skill 执行记录

### 步骤 6: brainstorming

- 状态: 待执行
- 结果: 待记录

### 步骤 7: test-driven-development

- 状态: 待执行
- 结果: 待记录

### 步骤 8: subagent-driven-development

- 状态: 待执行
- 结果: 待记录

### 步骤 9: verification-before-completion

- 状态: 待执行
- 结果: 待记录

### 步骤 10: requesting-code-review

- 状态: 待执行
- 结果: 待记录
