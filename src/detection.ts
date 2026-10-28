import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The minimal slice of the V2 plugin context needed for detection.
 * Keeping it structural avoids depending on non-exported internal types.
 */
export interface ProjectContext {
  readonly location: { readonly directory: string };
}

/**
 * Checks if the current workspace is an OpenSpec project.
 *
 * Detection logic:
 * 1. Checks for `openspec/config.yaml` (Primary indicator - new OPSX format)
 * 2. Checks for `openspec/AGENTS.md` (Fallback - legacy format)
 */
export async function isOpenSpecProject(ctx: ProjectContext): Promise<boolean> {
  const openspecDir = join(ctx.location.directory, "openspec");
  const configYamlPath = join(openspecDir, "config.yaml");
  const agentsMdPath = join(openspecDir, "AGENTS.md");

  return existsSync(configYamlPath) || existsSync(agentsMdPath);
}
