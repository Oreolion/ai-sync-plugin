import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { StatusProvider } from "./statusProvider";
import { SessionProvider } from "./sessionProvider";
import { handoffCommand } from "./commands/handoff";
import { resumeCommand } from "./commands/resume";

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    return;
  }

  // Create tree data providers
  const statusProvider = new StatusProvider(workspaceRoot);
  const sessionProvider = new SessionProvider(workspaceRoot);

  // Register tree views
  const statusView = vscode.window.createTreeView("aiSync.status", {
    treeDataProvider: statusProvider,
    showCollapseAll: true,
  });

  const sessionsView = vscode.window.createTreeView("aiSync.sessions", {
    treeDataProvider: sessionProvider,
  });

  context.subscriptions.push(statusView, sessionsView);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("aiSync.handoff", async () => {
      await handoffCommand(workspaceRoot);
      statusProvider.refresh();
      sessionProvider.refresh();
      updateStatusBar(statusProvider);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiSync.resume", async () => {
      await resumeCommand(workspaceRoot);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiSync.refresh", () => {
      statusProvider.refresh();
      sessionProvider.refresh();
      updateStatusBar(statusProvider);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("aiSync.openHandoff", async () => {
      const handoffPath = path.join(workspaceRoot, ".ai-sync", "HANDOFF.md");
      if (fs.existsSync(handoffPath)) {
        const doc = await vscode.workspace.openTextDocument(handoffPath);
        await vscode.window.showTextDocument(doc, { preview: false });
      } else {
        vscode.window.showWarningMessage(
          "AI Sync: No HANDOFF.md found in .ai-sync/"
        );
      }
    })
  );

  // Set up file watcher on .ai-sync/ directory
  const aiSyncPattern = new vscode.RelativePattern(
    workspaceRoot,
    ".ai-sync/**/*.md"
  );
  const fileWatcher = vscode.workspace.createFileSystemWatcher(aiSyncPattern);

  const refreshAll = () => {
    statusProvider.refresh();
    sessionProvider.refresh();
    updateStatusBar(statusProvider);
  };

  fileWatcher.onDidChange(refreshAll);
  fileWatcher.onDidCreate(refreshAll);
  fileWatcher.onDidDelete(refreshAll);

  context.subscriptions.push(fileWatcher);

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    50
  );
  statusBarItem.command = "aiSync.handoff";
  statusBarItem.tooltip = "AI Sync: Click to start handoff";
  context.subscriptions.push(statusBarItem);

  // Initial status bar update
  updateStatusBar(statusProvider);
}

export function deactivate(): void {
  // All disposables registered via context.subscriptions are
  // automatically disposed by VS Code.
}

function getWorkspaceRoot(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return undefined;
  }
  return folders[0].uri.fsPath;
}

function updateStatusBar(statusProvider: StatusProvider): void {
  const summary = statusProvider.getStatusSummary();
  if (summary) {
    statusBarItem.text = `$(sync) AI Sync: ${summary.phase} (${summary.percentage}%)`;
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}
