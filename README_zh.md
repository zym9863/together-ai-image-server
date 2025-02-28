# Together AI Image Server

[English](README.md) | 简体中文

一个基于TypeScript的MCP（Model Context Protocol）服务器，使用Together AI API生成图像。

## 概述

该服务器通过MCP协议提供了一个简单的接口，用于使用Together AI的图像生成模型。它允许Claude和其他MCP兼容的助手基于文本提示生成图像。

## 功能

### 工具

- `generate_image` - 根据文本提示生成图像
  - 需要文本提示作为必需参数
  - 可选参数用于控制生成步骤和图像数量
  - 返回生成图像的URL和本地路径

## 前置条件

- Node.js（推荐v14或更高版本）
- Together AI API密钥

## 安装

```bash
# 克隆仓库
git clone https://github.com/zym9863/together-ai-image-server.git
cd together-ai-image-server

# 安装依赖
npm install
```

## 配置

将Together AI API密钥设置为环境变量：

```bash
# 在Linux/macOS上
export TOGETHER_API_KEY="your-api-key-here"

# 在Windows命令提示符中
set TOGETHER_API_KEY=your-api-key-here

# 在Windows PowerShell中
$env:TOGETHER_API_KEY="your-api-key-here"
```

或者，您可以在项目根目录创建一个`.env`文件：

```
TOGETHER_API_KEY=your-api-key-here
```

## 开发

构建服务器：

```bash
npm run build
```

开发时自动重新构建：

```bash
npm run watch
```

## 与Claude Desktop一起使用

要与Claude Desktop一起使用，请添加服务器配置：

在macOS上：`~/Library/Application Support/Claude/claude_desktop_config.json`  
在Windows上：`%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Together AI Image Server": {
      "command": "/path/to/together-ai-image-server/build/index.js"
    }
  }
}
```

将`/path/to/together-ai-image-server`替换为您的实际安装路径。

## 调试

由于MCP服务器通过stdio通信，调试可能会有挑战性。我们建议使用[MCP Inspector](https://github.com/modelcontextprotocol/inspector)，它可以通过包脚本使用：

```bash
npm run inspector
```

Inspector将提供一个URL，用于在浏览器中访问调试工具。

## API参考

### generate_image

使用Together AI的图像生成API基于文本提示生成图像。

**参数：**

- `prompt` (string, 必需)：图像生成的文本提示
- `steps` (number, 可选, 默认值: 4)：扩散步骤数 (1-4)
- `n` (number, 可选, 默认值: 1)：生成图像的数量 (1-4)

**返回：**

JSON对象，包含：
- `image_urls`：生成图像的URL数组
- `local_paths`：本地缓存图像的路径数组

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交Pull Request。