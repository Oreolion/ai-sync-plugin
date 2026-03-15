import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import matter from "gray-matter";

export class SessionProvider implements vscode.TreeDataProvider<SessionItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SessionItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SessionItem): vscode.TreeItem {
    return element;
  }

  async getChildren(_element?: SessionItem): Promise<SessionItem[]> {
    if (!this.workspaceRoot) {
      return [];
    }

    const sessionsDir = path.join(this.workspaceRoot, ".ai-sync", "sessions");
    if (!fs.existsSync(sessionsDir)) {
      return [
        new SessionItem(
          "No sessions found",
          "",
          vscode.TreeItemCollapsibleState.None,
          undefined
        ),
      ];
    }

    try {
      const pattern = path.join(sessionsDir, "*.md").replace(/\\/g, "/");
      const files = await glob(pattern);

      if (files.length === 0) {
        return [
          new SessionItem(
            "No sessions found",
            "",
            vscode.TreeItemCollapsibleState.None,
            undefined
          ),
        ];
      }

      // Sort by modification time, newest first
      const fileStats = files.map((file) => ({
        file,
        mtime: fs.statSync(file).mtime,
      }));
      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      return fileStats.map(({ file }) => {
        const content = fs.readFileSync(file, "utf-8");
        let label: string;
        let description = "";

        try {
          const { data } = matter(content);
          const date = data.date ?? data.timestamp ?? path.basename(file, ".md");
          const agent = data.agent ?? "unknown";
          label = `${date} -- ${agent}`;
          if (data.phase) {
            description = String(data.phase);
          }
        } catch {
          label = path.basename(file, ".md");
        }

        return new SessionItem(
          label,
          description,
          vscode.TreeItemCollapsibleState.None,
          vscode.Uri.file(file)
        );
      });
    } catch {
      return [
        new SessionItem(
          "Error reading sessions",
          "",
          vscode.TreeItemCollapsibleState.None,
          undefined
        ),
      ];
    }
  }
}

export class SessionItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    desc: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    fileUri: vscode.Uri | undefined
  ) {
    super(label, collapsibleState);
    this.description = desc;
    this.iconPath = new vscode.ThemeIcon("history");
    this.tooltip = label;

    if (fileUri) {
      this.command = {
        command: "vscode.open",
        title: "Open Session Log",
        arguments: [fileUri],
      };
      this.resourceUri = fileUri;
    }
  }
}
