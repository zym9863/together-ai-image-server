import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { createHash } from 'crypto';

const API_KEY = process.env.TOGETHER_API_KEY;
if (!API_KEY) {
  throw new Error('TOGETHER_API_KEY environment variable is required');
}

const CACHE_DIR = path.join(os.tmpdir(), 'imagen-cache');

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log(`Create cache directory: ${CACHE_DIR}`);
  }
}

async function downloadImage(url: string): Promise<string> {
  const urlHash = createHash('md5').update(url).digest('hex');
  const fileExt = path.extname(new URL(url).pathname) || '.png'; 
  const fileName = `${urlHash}${fileExt}`;
  const filePath = path.join(CACHE_DIR, fileName);
  
  if (fs.existsSync(filePath)) {
    console.log(`The image already exists in the cache: ${filePath}`);
    return filePath;
  }
  
  console.log(`Downloading images: ${url}`);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer',
  });
  
  await promisify(fs.writeFile)(filePath, response.data);
  console.log(`The image has been saved to: ${filePath}`);
  
  return filePath;
}

/**
 * Create an MCP server with capabilities for tools.
 */
const server = new Server(
  {
    name: 'together-ai-image-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_image',
      description: 'Generate image from text prompt using Together AI API',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Text prompt for image generation',
          },
          steps: {
            type: 'number',
            description: 'Number of diffusion steps (default: 4)',
            minimum: 1,
            maximum: 4,
          },
          n: {
            type: 'number',
            description: 'Number of images to generate (default: 1, max: 4)',
            minimum: 1,
            maximum: 4,
          },
        },
        required: ['prompt'],
      },
    },
  ],
}));

/**
 * Handler for the generate_image tool.
 * Calls Together AI API to generate image and returns image URLs.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'generate_image') {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  const { prompt, steps = 4, n = 1 } = request.params.arguments as {
    prompt: string;
    steps?: number;
    n?: number;
  };

  try {
    ensureCacheDir();
    
    const response = await axios.post(
      'https://api.together.xyz/v1/images/generations',
      {
        model: 'black-forest-labs/FLUX.1-schnell-Free',
        prompt,
        steps,
        n,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('API Response structure:', JSON.stringify(response.data, null, 2));
    
    if (!response.data || !response.data.data) {
      throw new McpError(
        ErrorCode.InternalError,
        'Invalid API response: missing data'
      );
    }
    
    const image_urls = response.data.data.map((item: any) => item.url);
    
    const downloadPromises = image_urls.map(downloadImage);
    const localPaths = await Promise.all(downloadPromises);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            image_urls,
            local_paths: localPaths
          }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new McpError(
        ErrorCode.InternalError,
        `Together AI API error: ${
          error.response?.data.message ?? error.message
        }`
      );
    }
    throw error;
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
