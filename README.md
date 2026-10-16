# My Claude Code Implementation

This is my TypeScript/Bun implementation of the CodeCrafters
["Build your own Claude Code"](https://codecrafters.io/challenges/claude-code)
challenge.

I built this project to understand how an AI coding assistant works internally:
how it talks to an LLM, advertises tools, executes the tools requested by the
model, and continues the conversation until the model has a final answer.

## What it can do

The program currently gives the model three tools:

- `Read` - read the contents of a file
- `Write` - create or update a file
- `Bash` - execute a shell command

The application keeps the conversation history in memory. When the model
requests a tool, the program executes it and sends the result back to the
model. The loop continues until the model returns a normal text response.

Tool failures are returned to the model as explicit error messages so it can
decide how to continue.

## Project structure

- `app/main.ts` - application entry point and main agent loop
- `your_program.sh` - local launcher
- `.codecrafters/run.sh` - CodeCrafters launcher
- `package.json` - scripts and dependencies
- `tsconfig.json` - TypeScript configuration

## Running locally

Install the dependencies:

```sh
npm install
```

Set your OpenRouter API key. In PowerShell, for example:

```powershell
$env:OPENROUTER_API_KEY="your-api-key"
```

Run the program with a prompt:

```sh
./your_program.sh -p "Read app/main.ts and explain what it does"
```

You can also run it directly with Bun:

```sh
bun run app/main.ts -p "Calculate 8 * 8"
```

## Configuration

The program reads these environment variables:

- `OPENROUTER_API_KEY` - required API key
- `OPENROUTER_BASE_URL` - optional API endpoint override

If `OPENROUTER_BASE_URL` is not set, the program uses:

```text
https://openrouter.ai/api/v1
```

## Running the CodeCrafters tests

Submit the current implementation with:

```sh
codecrafters submit
```

CodeCrafters creates temporary files and runs `your_program.sh` against them.
The repository README is not used as the program's input during those tests.

## Checking the code

Run the TypeScript type checker with:

```sh
bunx tsc --noEmit
```

This project is part of my learning process, so the implementation is kept
small and focused on understanding the individual pieces of an LLM-powered
coding assistant.
