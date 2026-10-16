import OpenAI from "openai";
import { exec } from "child_process";

async function main() {
  const [, , flag, prompt] = process.argv;

  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  });

  const tools = [
    {
      type: "function" as const,
      function: {
        name: "Read",
        description: "Read and return the contents of a file",
        parameters: {
          type: "object",
          properties: {
            file_path: { type: "string" },
          },
          required: ["file_path"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "Write",
        description: "Write content to a file",
        parameters: {
          type: "object",
          properties: {
            file_path: { type: "string" },
            content: { type: "string" },
          },
          required: ["file_path", "content"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "Bash",
        description: "Execute a shell command",
        parameters: {
          type: "object",
          properties: {
            command: { type: "string" },
          },
          required: ["command"],
        },
      },
    },
  ];

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "user", content: prompt },
  ];

  while (true) {
    const res = await client.chat.completions.create({
      model: "anthropic/claude-haiku-4.5",
      messages,
      tools,
    });

    const message = res.choices[0].message;

    messages.push({
      role: "assistant",
      content: message.content ?? null,
      ...(message.tool_calls && { tool_calls: message.tool_calls }),
    });

    if (!message.tool_calls) {
      if (message.content) console.log(message.content);
      break;
    }

    for (const toolCall of message.tool_calls) {
      let result = "";

      if (toolCall.type === "function") {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const name = toolCall.function.name;

          if (name === "Read") {
            result = await Bun.file(args.file_path).text();
          } else if (name === "Write") {
            await Bun.write(args.file_path, args.content);
            result = args.content;
          } else if (name === "Bash") {
            result = await new Promise<string>((resolve) => {
              exec(args.command, (error, stdout, stderr) => {
                resolve(error ? stderr || error.message : stdout);
              });
            });
          } else {
            result = `Unknown tool: ${name}`;
          }
        } catch (error) {
          result = `Tool execution failed: ${
            error instanceof Error ? error.message : String(error)
          }`;
        }
      } else {
        result = `Unsupported tool call type: ${toolCall.type}`;
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }
}

main();