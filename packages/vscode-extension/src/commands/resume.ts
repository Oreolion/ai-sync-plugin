import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { parseHandoff, parseProgress } from "../protocol";

/**
 * Resume command: reads HANDOFF.md, shows a notification summarizing
 * the current state, and opens the file in the editor.
 */
export async function resumeCommand(workspaceRoot: string): Promise<void> {
  const handoffPath = path.join(workspaceRoot, ".ai-sync", "HANDOFF.md");

  if (!fs.existsSync(handoffPath)) {
    vscode.window.showWarningMessage(
      "AI Sync: No HANDOFF.md found. Run ai-sync init first."
    );
    return;
  }

  // Parse handoff
  let summary: string;
  try {
    const content = fs.readFileSync(handoffPath, "utf-8");
    const handoff = parseHandoff(content);

    const parts: string[] = [
      `Status: ${handoff.status}`,
      `Agent: ${handoff.agent}`,
      `Phase: ${handoff.phase}`,
      `Build: ${handoff.build_status}`,
    ];

    // Try to include progress
    const progressPath = path.join(workspaceRoot, ".ai-sync", "PROGRESS.md");
    if (fs.existsSync(progressPath)) {
      try {
        const progressContent = fs.readFileSync(progressPath, "utf-8");
        const progress = parseProgress(progressContent);
        if (progress.total > 0) {
          parts.push(
            `Progress: ${progress.completed}/${progress.total} (${progress.percentage}%)`
          );
        }
      } catch {
        // Ignore progress parse errors
      }
    }

    if (handoff.stop_reason) {
      parts.push(`Reason: ${handoff.stop_reason}`);
    }

    if (handoff.next_steps.length > 0) {
      parts.push(`Next: ${handoff.next_steps[0]}`);
      if (handoff.next_steps.length > 1) {
        parts.push(`  (+${handoff.next_steps.length - 1} more steps)`);
      }
    }

    summary = parts.join(" | ");
  } catch {
    summary = "Error reading HANDOFF.md";
  }

  // Show notification
  vscode.window.showInformationMessage(`AI Sync Resume: ${summary}`);

  // Open HANDOFF.md in editor
  const doc = await vscode.workspace.openTextDocument(handoffPath);
  await vscode.window.showTextDocument(doc, { preview: false });
}
