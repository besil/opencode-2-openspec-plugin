import { Plugin } from "@opencode/plugin";
import { isOpenSpecProject } from "./detection";
import { OPENSPEC_SYSTEM_PROMPT } from "./prompts";

export default Plugin.define({
  id: "opencode-2-openspec-plugin",
  async setup(ctx) {
    // Auto-detection: only activate in OpenSpec projects
    const isActive = await isOpenSpecProject(ctx);
    if (!isActive) {
      return;
    }

    // Register (create-or-update) the dedicated planning agent.
    //
    // V2's `AgentEditor.update` is an upsert: when the ID does not exist it
    // starts from `Agent.Info.default(id)`. Permission rules are evaluated
    // last-match-wins, so the specific allow rules are appended after the
    // broad denies.
    await ctx.agent.transform((editor) => {
      editor.update("openspec-planner", (agent) => {
        agent.name = "openspec-planner" as typeof agent.name;
        agent.description =
          "OpenSpec Architect - Plan and specify software architecture.";
        agent.system = OPENSPEC_SYSTEM_PROMPT;
        agent.mode = "primary";
        agent.color = "#FF6B6B";
        agent.permissions.push(
          // --- Safety guard: ask before touching paths outside the workspace ---
          { action: "external_directory", resource: "*", effect: "ask" },

          // --- Edit: deny everything, then allow only spec files ---
          { action: "edit", resource: "*", effect: "deny" },
          { action: "edit", resource: "project.md", effect: "allow" },
          { action: "edit", resource: "AGENTS.md", effect: "allow" },
          { action: "edit", resource: "openspec/**", effect: "allow" },
          { action: "edit", resource: "specs/**", effect: "allow" },

          // --- Shell: deny all by default, allow read-only + openspec + git reads ---
          { action: "shell", resource: "*", effect: "deny" },
          { action: "shell", resource: "openspec", effect: "allow" },
          { action: "shell", resource: "openspec *", effect: "allow" },
          { action: "shell", resource: "grep *", effect: "allow" },
          { action: "shell", resource: "ls", effect: "allow" },
          { action: "shell", resource: "ls *", effect: "allow" },
          { action: "shell", resource: "cat *", effect: "allow" },
          { action: "shell", resource: "find *", effect: "allow" },
          { action: "shell", resource: "echo", effect: "allow" },
          { action: "shell", resource: "echo *", effect: "allow" },
          { action: "shell", resource: "pwd", effect: "allow" },
          { action: "shell", resource: "which *", effect: "allow" },
          { action: "shell", resource: "env", effect: "allow" },
          { action: "shell", resource: "printenv *", effect: "allow" },
          { action: "shell", resource: "git status*", effect: "allow" },
          { action: "shell", resource: "git log*", effect: "allow" },
          { action: "shell", resource: "git diff*", effect: "allow" },
          { action: "shell", resource: "git show*", effect: "allow" },
        );
      });
    });
  },
});
