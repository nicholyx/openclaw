# Fix Issue #49613: Non-default agents do not inherit agents.defaults.heartbeat

## Issue 概述

- **Issue 编号**: #49613
- **Issue 类型**: bug
- **仓库**: openclaw/openclaw
- **状态**: Completed

## 问题描述

非默认agent不会继承`agents.defaults.heartbeat`配置，除非它们在`agents.list`中明确定义了自己的`heartbeat`字段。

## 相关链接

- Issue URL: https://github.com/openclaw/openclaw/issues/49613

## 实现计划

- [x] 理解需求
- [x] 编写测试（临时验证）
- [x] 实现修复
- [x] 验证通过
- [x] 代码审查（自动）

## 进度记录

- 2026-03-18: 开始处理，找到问题根源在`src/agents/agent-scope.ts`的`resolveAgentConfig`函数
- 2026-03-18: 实现修复，修改函数使其合并默认配置和agent自定义配置
- 2026-03-18: 编写测试验证修复正确，所有继承逻辑正常工作
- 2026-03-18: 修复代码格式，通过lint检查

## 修复说明

### 根本原因

`resolveAgentConfig`函数之前只直接返回agent entry中的字段，当entry中没有定义某些字段时，没有自动合并`agents.defaults`中的对应配置。

### 修复内容

修改了`resolveAgentConfig`函数，现在会正确合并默认配置和agent自定义配置：

- 对于`model`、`workspace`、`memorySearch`、`humanDelay`、`heartbeat`、`subagents`、`sandbox`这些存在于defaults中的字段，如果agent没有自定义，就使用defaults中的值
- 其他字段保持原有逻辑，只有agent明确定义时才返回

### 验证结果

✅ 默认agent未定义heartbeat时，正确继承了defaults的heartbeat配置
✅ 自定义agent定义了heartbeat时，优先使用自己的配置
✅ 其他可继承字段也都正确继承了defaults配置
✅ 代码格式和类型检查通过
