import * as fs from "fs";
import * as path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Type } from "@google/genai";

let mcpClient: Client | null = null;

export async function getMcpClient() {
  if (mcpClient) return mcpClient;

  try {
    const mcpPath = path.join(process.cwd(), "mcp.json");
    if (!fs.existsSync(mcpPath)) {
      console.warn("mcp.json not found");
      return null;
    }

    const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, "utf-8"));
    const tfConfig = mcpConfig?.mcpServers?.tutorflow;

    if (!tfConfig) {
      console.warn("tutorflow server not configured in mcp.json");
      return null;
    }

    const transport = new SSEClientTransport(new URL(tfConfig.url), {
      eventSourceInit: { headers: tfConfig.headers || {} },
      requestInit: { headers: tfConfig.headers || {} }
    } as any);

    mcpClient = new Client(
      { name: "grademaster-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await mcpClient.connect(transport);
    return mcpClient;
  } catch (err) {
    console.error("Failed to initialize MCP client:", err);
    return null;
  }
}

// Convert JSON Schema type to Gemini SchemaType
function mapJsonSchemaTypeToGeminiType(type: string): Type {
  switch (type?.toLowerCase()) {
    case "string": return Type.STRING;
    case "number": return Type.NUMBER;
    case "integer": return Type.INTEGER;
    case "boolean": return Type.BOOLEAN;
    case "array": return Type.ARRAY;
    case "object": return Type.OBJECT;
    default: return Type.STRING;
  }
}

// Convert JSON schema to Gemini Schema
function mapJsonSchemaToGeminiSchema(schema: any): any {
  if (!schema) return undefined;
  
  const result: any = {};
  
  if (schema.type) {
    result.type = mapJsonSchemaTypeToGeminiType(schema.type);
  }

  if (schema.description) {
    result.description = schema.description;
  }

  if (schema.properties) {
    result.properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      result.properties[key] = mapJsonSchemaToGeminiSchema(value);
    }
  }

  if (schema.required) {
    result.required = schema.required;
  }

  if (schema.items) {
    result.items = mapJsonSchemaToGeminiSchema(schema.items);
  }

  if (schema.enum) {
    result.enum = schema.enum;
  }

  return result;
}

export async function getGeminiToolsFromMcp() {
  const client = await getMcpClient();
  if (!client) return [];

  try {
    const toolsResponse = await client.listTools();
    const functionDeclarations = toolsResponse.tools.map(tool => {
      const gSchema = mapJsonSchemaToGeminiSchema(tool.inputSchema);
      if (gSchema && !gSchema.type) {
        gSchema.type = Type.OBJECT;
      }
      return {
        name: tool.name,
        description: tool.description || `Call the ${tool.name} tool`,
        parameters: gSchema
      };
    });

    if (functionDeclarations.length === 0) return [];

    return [{
      function_declarations: functionDeclarations
    }];
  } catch (err) {
    console.error("Failed to fetch tools from MCP:", err);
    return [];
  }
}

export async function executeMcpTool(name: string, args: any) {
  const client = await getMcpClient();
  if (!client) throw new Error("MCP client not available");

  try {
    const result = await client.callTool({
      name,
      arguments: args
    });
    return result;
  } catch (err) {
    console.error(`Error executing MCP tool ${name}:`, err);
    throw err;
  }
}
