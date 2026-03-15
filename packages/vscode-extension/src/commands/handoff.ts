import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface HandoffInput {
  status: string;
  stopReason: string;
  nextSteps: string[];
}

/**
 * Guided handoff flow: collects status, stop reason, and next steps,
 * then writes an updated HANDOFF.md.
 */
export async function handoffCommand(workspaceRoot: string): Promise<void> {
  // Step 1: Pick status
  const statusPick = await vscode.window.showQuickPick(
    [
      { label: "paused", description: "Work paused, can be resumed" },
      { label: "blocked", description: "Blocked on an issue" },
      { label: "completed", description: "Phase/task completed" },
    ],
    {
      placeHolder: "Select handoff status",
      title: "AI Sync: Handoff Status",
    }
  );

  if (!statusPick) {
    return; // User cancelled
  }

  // Step 2: Stop reason
  const stopReason = await vscode.window.showInputBox({
    prompt: "Why are you stopping? (stop reason)",
    placeHolder: "e.g., Completed phase 2 migration, need review",
    title: "AI Sync: Stop Reason",
  });

  if (stopReason === undefined) {
    return; // User cancelled
  }

  // Step 3: Next steps (comma-separated)
  const nextStepsRaw = await vscode.window.showInputBox({
    prompt: "What should the next agent do? (comma-separated steps)",
    placeHolder: "e.g., Run tests, Fix failing migration, Review auth flow",
    title: "AI Sync: Next Steps",
  });

  if (nextStepsRaw === undefined) {
    return; // User cancelled
  }

  const input: HandoffInput = {
    status: statusPick.label,
    stopReason: stopReason,
    nextSteps: nextStepsRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  };

  // Write HANDOFF.md
  await writeHandoff(workspaceRoot, input);

  vscode.window.showInformationMessage(
    `AI Sync: Handoff written (status: ${input.status})`
  );
}

async function writeHandoff(
  workspaceRoot: string,
  input: HandoffInput
): Promise<void> {
  const aiSyncDir = path.join(workspaceRoot, ".ai-sync");

  // Ensure .ai-sync directory exists
  if (!fs.existsSync(aiSyncDir)) {
    fs.mkdirSync(aiSyncDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const nextStepsYaml = input.nextSteps
    .map((step) => `  - "${step}"`)
    .join("\n");

  const content = `---
status: ${input.status}
agent: vscode-user
timestamp: "${timestamp}"
phase: handoff
build_status: unknown
stop_reason: "${input.stopReason}"
next_steps:
${nextStepsYaml}
---

# Handoff

**Status**: ${input.status}
**Stop Reason**: ${input.stopReason}
**Timestamp**: ${timestamp}

## Next Steps

${input.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;

  const handoffPath = path.join(aiSyncDir, "HANDOFF.md");
  fs.writeFileSync(handoffPath, content, "utf-8");

  // Also archive to sessions directory
  const sessionsDir = path.join(aiSyncDir, "sessions");
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }

  const sessionFilename = `${timestamp.replace(/[:.]/g, "-")}.md`;
  const sessionPath = path.join(sessionsDir, sessionFilename);
  fs.writeFileSync(sessionPath, content, "utf-8");
}
