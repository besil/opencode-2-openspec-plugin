# opencode-2-openspec-plugin

[![npm version](https://img.shields.io/npm/v/opencode-2-openspec-plugin.svg)](https://www.npmjs.com/package/opencode-2-openspec-plugin)

An [OpenCode](https://opencode.ai) **v2** plugin that integrates [OpenSpec](https://github.com/Fission-AI/OpenSpec), providing a dedicated **`openspec-planner`** agent for planning and specifying software architecture.

## Motivation

When using OpenCode's standard **Build** agent to create or modify OpenSpec planning documents, AI agents often attempt to start implementing code changes immediately, before the planning phase is complete. This leads to premature coding and a lack of focus on architectural design.

This plugin adds a specialized **`openspec-planner`** agent that:

- **Allows** creating and editing OpenSpec documents (e.g., `project.md`, `openspec/**`, `specs/**`).
- **Prevents** modifications to implementation code.
- **Focuses** entirely on planning and specification, ensuring a clean separation between design and implementation.

## Features

- **Auto-Detection**: Automatically detects whether the current workspace is an OpenSpec project. In non-OpenSpec projects the plugin does nothing.
- **New Agent: `openspec-planner`**: A dedicated primary agent for creating and editing OpenSpec files.
- **Smart Permissions**: Automatically grants write permissions for:
  - `project.md`
  - `AGENTS.md`
  - `openspec/**`
  - `specs/**`
- **Read-Only Safety**: Keeps the rest of the codebase read-only while using the `openspec-planner` agent. Shell access is limited to read-only filesystem tools, the `openspec` CLI, and read-only Git commands.

## Installation

Add the package to the `plugins` array in your OpenCode configuration file (usually `~/.config/opencode/opencode.jsonc` or `.opencode/opencode.jsonc`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode-2-openspec-plugin"]
}
```

OpenCode installs npm plugins automatically the next time it starts.

Or install the CLI-managed way:

```sh
opencode plugin add opencode-2-openspec-plugin
```

> **Note:** OpenCode v2 reads the `plugins` key. Do not confuse it with the legacy v1 `plugin` key.

## Usage

1. Open an OpenSpec project in OpenCode.
2. The plugin detects the project structure automatically.
3. Switch to the **OpenSpec Planner** agent (color `#FF6B6B`) in the agent selector.
4. Start planning your architecture. The agent can modify your spec files while keeping your implementation code safe.

## How it works

The plugin exports a [`Plugin.define`](https://opencode.ai/v2/docs/build/plugins) server part. During `setup`, it:

1. Checks for `openspec/config.yaml` or `openspec/AGENTS.md`.
2. If found, registers the `openspec-planner` agent via `ctx.agent.transform(...)`.
3. The agent's permission rules use last-match-wins ordering: edits are denied broadly and then allowed only for spec files; shell commands are denied and then allowed only for read-only tooling.

## Development

```sh
git clone https://github.com/besil/opencode-2-openspec-plugin.git
cd opencode-2-openspec-plugin
bun install
bun run build     # bundle to dist/index.js
bun run watch     # rebuild on change
```

## Publishing

Publishing is automated by GitHub Actions using npm **Trusted Publishing** (OIDC). No long-lived npm token is stored in the repository.

### One-time setup

npm requires the package to exist before a Trusted Publisher can be attached. Bootstrap it once from your machine:

```sh
npm login                 # interactive, with 2FA
npm publish --access public
```

Then attach the GitHub Actions trusted publisher (either in the npm UI under **Package → Settings → Trusted Publishing**, or with the CLI):

```sh
npm trust github opencode-2-openspec-plugin \
  --file publish.yml \
  --repo besil/opencode-2-openspec-plugin \
  --allow-publish
```

> Newer npm versions can run `npm trust github` before the first publish; if it refuses, do the one-time `npm publish` above first.

Optionally harden the package afterwards under **Settings → Publishing access → Require two-factor authentication and disallow tokens**.

### Releasing

```sh
git tag v0.1.0
git push origin v0.1.0
```

The `publish.yml` workflow builds the plugin and publishes it to npm over OIDC. The `id-token: write` permission in the workflow is the only credential involved.

## License

MIT
