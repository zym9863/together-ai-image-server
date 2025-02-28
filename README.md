# Together AI Image Server

English | [简体中文](README_zh.md)

A TypeScript-based MCP (Model Context Protocol) server for generating images using Together AI API.

## Overview

This server provides a simple interface to generate images using Together AI's image generation models through the MCP protocol. It allows Claude and other MCP-compatible assistants to generate images based on text prompts.

## Features

### Tools

- `generate_image` - Generate images from text prompts
  - Takes a text prompt as required parameter
  - Optional parameters for controlling generation steps and number of images
  - Returns URLs and local paths to generated images

## Prerequisites

- Node.js (v14 or later recommended)
- Together AI API key

## Installation

```bash
# Clone the repository
git clone https://github.com/zym9863/together-ai-image-server.git
cd together-ai-image-server

# Install dependencies
npm install
```

## Configuration

Set your Together AI API key as an environment variable:

```bash
# On Linux/macOS
export TOGETHER_API_KEY="your-api-key-here"

# On Windows (Command Prompt)
set TOGETHER_API_KEY=your-api-key-here

# On Windows (PowerShell)
$env:TOGETHER_API_KEY="your-api-key-here"
```

Alternatively, you can create a `.env` file in the project root:

```
TOGETHER_API_KEY=your-api-key-here
```

## Development

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Usage with Claude Desktop

To use with Claude Desktop, add the server config:

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`  
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Together AI Image Server": {
      "command": "/path/to/together-ai-image-server/build/index.js"
    }
  }
}
```

Replace `/path/to/together-ai-image-server` with the actual path to your installation.

## Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## API Reference

### generate_image

Generates images based on a text prompt using Together AI's image generation API.

**Parameters:**

- `prompt` (string, required): Text prompt for image generation
- `steps` (number, optional, default: 4): Number of diffusion steps (1-4)
- `n` (number, optional, default: 1): Number of images to generate (1-4)

**Returns:**

JSON object containing:
- `image_urls`: Array of URLs to the generated images
- `local_paths`: Array of paths to locally cached images

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
