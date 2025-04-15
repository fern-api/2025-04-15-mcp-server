#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CommandName, commands } from "./commands";
import { connectToSocket, sendCommandToSocket } from "./socket";

const packageJson = require("../package.json") as any;

// Create a new MCP server
const server = new McpServer(
  {
    name: packageJson.name,
    version: packageJson.version,
  },
  {
    instructions: "Use these tools to update the design of a Webflow page.",
  }
);

// Handle apiType: "socket" commands
async function handleSocketCommand(commandName: CommandName, params: unknown) {
  console.error("[handleSocketCommand]", { commandName, params });
  let result: unknown;
  switch (commandName) {
    case "get_all_elements":
    case "get_selected_element":
    case "set_selected_element":
    case "set_text_content":
    case "insert_element_before":
    case "insert_element_after":
    case "prepend_element":
    case "append_element":
    case "set_style_background_color": {
      result = await sendCommandToSocket(commandName, params);
      break;
    }
    default: {
      throw new Error(
        `[handleSocketCommand] Unsupported commandName: ${commandName}`
      );
    }
  }
  return result;
}

// Register all commands as MCP tools
function registerTools() {
  commands.forEach(({ commandName, description, paramsSchema, apiType }) => {
    server.tool(
      commandName,
      description,
      paramsSchema,
      async (params: unknown) => {
        let result: unknown;
        switch (apiType) {
          case "socket": {
            result = await handleSocketCommand(commandName, params);
            break;
          }
          default: {
            throw new Error(`[registerTools] Unsupported apiType: ${apiType}`);
          }
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result),
            },
          ],
        };
      }
    );
  });
}

// Start the server
async function run() {
  try {
    connectToSocket(3055);
    registerTools();
    // Use stdio for transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Since stdout is used for MCP messages, use stderr for logging
    console.error("MCP server connected via stdio");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

run();
