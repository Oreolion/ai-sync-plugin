import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { parseHandoff, parseProgress, HandoffData, ProgressData } from "./protocol";

type StatusTreeItem = SyncStatusItem;

export class StatusProvider implements vscode.TreeDataProvider<StatusTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<StatusTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: StatusTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: StatusTreeItem): Thenable<StatusTreeItem[]> {
    if (!this.workspaceRoot) {
      return Promise.resolve([]);
    }

    if (element) {
      // Return children for expandable items (next steps)
      return Promise.resolve(element.children ?? []);
    }

    return Promise.resolve(this.getRootItems());
  }

  private getRootItems(): StatusTreeItem[] {
    const handoffPath = path.join(this.workspaceRoot, ".ai-sync", "HANDOFF.md");
    const progressPath = path.join(this.workspaceRoot, ".ai-sync", "PROGRESS.md");

    if (!fs.existsSync(handoffPath)) {
      return [
        new SyncStatusItem(
          "No HANDOFF.md found",
          "Run ai-sync init to get started",
          vscode.TreeItemCollapsibleState.None,
          "info"
        ),
      ];
    }

    const items: StatusTreeItem[] = [];

    // Parse handoff
    let handoff: HandoffData;
    try {
      const content = fs.readFileSync(handoffPath, "utf-8");
      handoff = parseHandoff(content);
    } catch {
      return [
        new SyncStatusItem(
          "Error reading HANDOFF.md",
          "",
          vscode.TreeItemCollapsibleState.None,
          "error"
        ),
      ];
    }

    // Status
    const statusIcon = this.getStatusIcon(handoff.status);
    items.push(
      new SyncStatusItem(
        `Status: ${handoff.status}`,
        "",
        vscode.TreeItemCollapsibleState.None,
        statusIcon
      )
    );

    // Last Agent
    items.push(
      new SyncStatusItem(
        `Last Agent: ${handoff.agent}`,
        handoff.timestamp !== "unknown" ? `at ${handoff.timestamp}` : "",
        vscode.TreeItemCollapsibleState.None,
        "account"
      )
    );

    // Phase
    items.push(
      new SyncStatusItem(
        `Phase: ${handoff.phase}`,
        "",
        vscode.TreeItemCollapsibleState.None,
        "layers"
      )
    );

    // Progress
    let progress: ProgressData | null = null;
    if (fs.existsSync(progressPath)) {
      try {
        const progressContent = fs.readFileSync(progressPath, "utf-8");
        progress = parseProgress(progressContent);
      } catch {
        // Silently ignore progress parse errors
      }
    }

    if (progress && progress.total > 0) {
      items.push(
        new SyncStatusItem(
          `Progress: ${progress.completed}/${progress.total} (${progress.percentage}%)`,
          "",
          vscode.TreeItemCollapsibleState.None,
          "tasklist"
        )
      );
    }

    // Build Status
    const buildIcon = handoff.build_status === "clean" ? "pass" : "error";
    items.push(
      new SyncStatusItem(
        `Build: ${handoff.build_status}`,
        "",
        vscode.TreeItemCollapsibleState.None,
        buildIcon
      )
    );

    // Stop Reason
    if (handoff.stop_reason) {
      items.push(
        new SyncStatusItem(
          `Reason: ${handoff.stop_reason}`,
          "",
          vscode.TreeItemCollapsibleState.None,
          "comment"
        )
      );
    }

    // Next Steps (expandable)
    if (handoff.next_steps.length > 0) {
      const nextStepsChildren = handoff.next_steps.map(
        (step, index) =>
          new SyncStatusItem(
            `${index + 1}. ${step}`,
            "",
            vscode.TreeItemCollapsibleState.None,
            "arrow-right"
          )
      );

      const nextStepsItem = new SyncStatusItem(
        `Next Steps (${handoff.next_steps.length})`,
        "",
        vscode.TreeItemCollapsibleState.Expanded,
        "checklist"
      );
      nextStepsItem.children = nextStepsChildren;
      items.push(nextStepsItem);
    }

    return items;
  }

  private getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case "in-progress":
        return "sync~spin";
      case "paused":
        return "debug-pause";
      case "blocked":
        return "warning";
      case "completed":
        return "pass-filled";
      default:
        return "question";
    }
  }

  /** Expose parsed data for the status bar */
  getStatusSummary(): { phase: string; percentage: number } | null {
    const handoffPath = path.join(this.workspaceRoot, ".ai-sync", "HANDOFF.md");
    const progressPath = path.join(this.workspaceRoot, ".ai-sync", "PROGRESS.md");

    if (!fs.existsSync(handoffPath)) {
      return null;
    }

    try {
      const handoffContent = fs.readFileSync(handoffPath, "utf-8");
      const handoff = parseHandoff(handoffContent);

      let percentage = 0;
      if (fs.existsSync(progressPath)) {
        const progressContent = fs.readFileSync(progressPath, "utf-8");
        const progress = parseProgress(progressContent);
        percentage = progress.percentage;
      }

      return { phase: handoff.phase, percentage };
    } catch {
      return null;
    }
  }
}

export class SyncStatusItem extends vscode.TreeItem {
  children: SyncStatusItem[] | undefined;

  constructor(
    public readonly label: string,
    private desc: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    iconId: string
  ) {
    super(label, collapsibleState);
    this.description = desc;
    this.iconPath = new vscode.ThemeIcon(iconId);
    this.tooltip = desc ? `${label} - ${desc}` : label;
  }
}
