import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HandoffFrontmatter {
  last_agent: string;
  timestamp: string;
  status: string;
  current_phase: string;
  current_task: string;
  stop_reason: string;
  [key: string]: string;
}

interface ProgressTask {
  line: string;
  checked: boolean;
  text: string;
  lineIndex: number;
}

interface ProgressPhase {
  name: string;
  status: string;
  tasks: ProgressTask[];
}

interface ChangedFile {
  filename: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run a git command and capture stdout.
 */
async function git(...args: string[]): Promise<string> {
  let stdout = "";
  await exec.exec("git", args, {
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString();
      },
    },
    silent: true,
  });
  return stdout.trim();
}

/**
 * Parse PROGRESS.md into structured phases and tasks.
 */
function parseProgress(content: string): ProgressPhase[] {
  const lines = content.split("\n");
  const phases: ProgressPhase[] = [];
  let currentPhase: ProgressPhase | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match phase headers like: ## Phase 1: Setup — IN PROGRESS
    const phaseMatch = line.match(
      /^##\s+(.+?)\s*(?:—|--|-)\s*(COMPLETE|IN PROGRESS|PENDING)/i
    );
    if (phaseMatch) {
      currentPhase = {
        name: phaseMatch[1].trim(),
        status: phaseMatch[2].trim().toUpperCase(),
        tasks: [],
      };
      phases.push(currentPhase);
      continue;
    }

    // Match task lines like: - [x] Task description or - [ ] Task description
    const taskMatch = line.match(/^(\s*-\s+\[)([ xX])(\]\s+)(.+)$/);
    if (taskMatch && currentPhase) {
      currentPhase.tasks.push({
        line: line,
        checked: taskMatch[2].toLowerCase() === "x",
        text: taskMatch[4].trim(),
        lineIndex: i,
      });
    }
  }

  return phases;
}

/**
 * Check whether a task description references any of the changed file paths.
 * Matches file paths like `src/auth.ts`, path fragments, or quoted paths.
 */
function taskMatchesChangedFiles(
  taskText: string,
  changedFiles: string[]
): boolean {
  for (const file of changedFiles) {
    // Direct path mention (with or without backticks)
    if (taskText.includes(file)) {
      return true;
    }

    // Match the basename
    const basename = path.basename(file);
    if (basename.length > 3 && taskText.includes(basename)) {
      return true;
    }

    // Match backtick-quoted paths like `src/auth.ts`
    const backtickPaths = taskText.match(/`([^`]+)`/g);
    if (backtickPaths) {
      for (const quoted of backtickPaths) {
        const inner = quoted.slice(1, -1);
        if (file.includes(inner) || inner.includes(file)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Update PROGRESS.md content by checking off tasks that match changed files.
 * Returns the updated content and list of tasks that were auto-completed.
 */
function autoUpdateProgress(
  content: string,
  changedFiles: string[]
): { updatedContent: string; completedTasks: string[] } {
  const lines = content.split("\n");
  const completedTasks: string[] = [];
  const phases = parseProgress(content);

  for (const phase of phases) {
    for (const task of phase.tasks) {
      if (!task.checked && taskMatchesChangedFiles(task.text, changedFiles)) {
        // Replace [ ] with [x] on this line
        lines[task.lineIndex] = lines[task.lineIndex].replace(
          /\[\s\]/,
          "[x]"
        );
        completedTasks.push(task.text);
      }
    }
  }

  return {
    updatedContent: lines.join("\n"),
    completedTasks,
  };
}

/**
 * Build the "Files Modified/Created" section from changed files.
 */
function buildFilesSection(changedFiles: ChangedFile[]): string {
  const created = changedFiles.filter((f) => f.status === "added");
  const modified = changedFiles.filter((f) => f.status === "modified");
  const deleted = changedFiles.filter((f) => f.status === "removed");
  const renamed = changedFiles.filter((f) => f.status === "renamed");

  let section = "";

  if (created.length > 0) {
    section += "**Created:**\n";
    for (const f of created) {
      section += `- \`${f.filename}\`\n`;
    }
    section += "\n";
  }

  if (modified.length > 0) {
    section += "**Modified:**\n";
    for (const f of modified) {
      section += `- \`${f.filename}\`\n`;
    }
    section += "\n";
  }

  if (deleted.length > 0) {
    section += "**Deleted:**\n";
    for (const f of deleted) {
      section += `- \`${f.filename}\`\n`;
    }
    section += "\n";
  }

  if (renamed.length > 0) {
    section += "**Renamed:**\n";
    for (const f of renamed) {
      section += `- \`${f.filename}\`\n`;
    }
    section += "\n";
  }

  return section.trimEnd();
}

/**
 * Update HANDOFF.md with PR context: timestamp, files, build status.
 */
function updateHandoff(
  existingContent: string,
  changedFiles: ChangedFile[],
  prTitle: string,
  prNumber: number
): string {
  const parsed = matter(existingContent);
  const data = parsed.data as Partial<HandoffFrontmatter>;

  // Update frontmatter fields
  data.timestamp = new Date().toISOString();
  data.last_agent = "github-action";
  if (!data.status) {
    data.status = "in-progress";
  }

  // Rebuild the body — preserve existing sections but update Files Modified/Created
  let body = parsed.content;

  // Replace or append "Files Modified/Created" section
  const filesSection = buildFilesSection(changedFiles);
  const filesSectionHeader = "## Files Modified/Created";
  const filesSectionRegex =
    /## Files Modified\/Created[\s\S]*?(?=\n## |\n---|\s*$)/;

  if (filesSectionRegex.test(body)) {
    body = body.replace(
      filesSectionRegex,
      `${filesSectionHeader}\n\n*Updated by PR #${prNumber}: ${prTitle}*\n\n${filesSection}`
    );
  } else {
    body += `\n\n${filesSectionHeader}\n\n*Updated by PR #${prNumber}: ${prTitle}*\n\n${filesSection}`;
  }

  // Replace or append "Build Status" section
  const buildStatusHeader = "## Build Status";
  const buildStatusRegex =
    /## Build Status[\s\S]*?(?=\n## |\n---|\s*$)/;
  const buildStatusContent = `${buildStatusHeader}\n\n*Pending — see PR #${prNumber} checks*`;

  if (buildStatusRegex.test(body)) {
    body = body.replace(buildStatusRegex, buildStatusContent);
  } else {
    body += `\n\n${buildStatusContent}`;
  }

  return matter.stringify(body, data);
}

/**
 * Build the PR comment body for sync status.
 */
function buildCommentBody(
  phases: ProgressPhase[],
  completedTasks: string[],
  handoffData: Partial<HandoffFrontmatter>
): string {
  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTotal = phases.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.checked).length,
    0
  );
  const pct = totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0;

  let comment = `## AI Sync Status\n\n`;
  comment += `**Phase:** ${handoffData.current_phase || "Unknown"}\n`;
  comment += `**Progress:** ${completedTotal}/${totalTasks} tasks (${pct}%)\n`;
  comment += `**Last Agent:** ${handoffData.last_agent || "Unknown"}\n\n`;

  if (completedTasks.length > 0) {
    comment += `### Tasks auto-completed by this PR\n`;
    for (const task of completedTasks) {
      comment += `- [x] ${task}\n`;
    }
    comment += "\n";
  }

  // Find the current in-progress phase and show remaining tasks
  const inProgressPhase = phases.find(
    (p) => p.status === "IN PROGRESS"
  );
  if (inProgressPhase) {
    const remaining = inProgressPhase.tasks.filter((t) => !t.checked);
    if (remaining.length > 0) {
      comment += `### Remaining in current phase\n`;
      for (const task of remaining) {
        comment += `- [ ] ${task.text}\n`;
      }
      comment += "\n";
    }
  }

  comment += `---\n*Updated by [AI Sync Action](https://github.com/Oreolion/ai-sync-plugin) at ${new Date().toISOString()}*`;

  return comment;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run(): Promise<void> {
  try {
    // -----------------------------------------------------------------------
    // 1. Get inputs
    // -----------------------------------------------------------------------
    const syncDir = core.getInput("sync-dir") || ".ai-sync";
    const autoProgress = core.getInput("auto-progress") !== "false";
    const postComment = core.getInput("comment") !== "false";

    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    const syncPath = path.resolve(workspace, syncDir);

    core.info(`Sync directory: ${syncPath}`);
    core.info(`Auto-progress: ${autoProgress}`);
    core.info(`Post comment: ${postComment}`);

    // -----------------------------------------------------------------------
    // 2. Check if .ai-sync/ exists
    // -----------------------------------------------------------------------
    if (!fs.existsSync(syncPath)) {
      core.info(
        `No ${syncDir}/ directory found. Skipping AI Sync update. ` +
          `Run "ai-sync init" or "/sync-init" to bootstrap.`
      );
      return;
    }

    // -----------------------------------------------------------------------
    // 3. Get PR context
    // -----------------------------------------------------------------------
    const context = github.context;

    if (!context.payload.pull_request) {
      core.info("Not a pull request event. Skipping.");
      return;
    }

    const pr = context.payload.pull_request;
    const prNumber: number = pr.number;
    const prTitle: string = pr.title;
    const prBranch: string = pr.head.ref;

    core.info(`Processing PR #${prNumber}: ${prTitle}`);

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      core.setFailed(
        "GITHUB_TOKEN is required. Set it via env: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}"
      );
      return;
    }

    const octokit = github.getOctokit(token);
    const { owner, repo } = context.repo;

    // -----------------------------------------------------------------------
    // 4. Get changed files from the PR
    // -----------------------------------------------------------------------
    const changedFiles: ChangedFile[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
        per_page: perPage,
        page,
      });

      for (const file of response.data) {
        changedFiles.push({
          filename: file.filename,
          status: file.status,
        });
      }

      if (response.data.length < perPage) {
        break;
      }
      page++;
    }

    core.info(`Found ${changedFiles.length} changed files in PR`);

    const changedFilenames = changedFiles.map((f) => f.filename);

    // -----------------------------------------------------------------------
    // 5. Read current HANDOFF.md
    // -----------------------------------------------------------------------
    const handoffPath = path.join(syncPath, "HANDOFF.md");
    let handoffContent = "";
    let handoffData: Partial<HandoffFrontmatter> = {};

    if (fs.existsSync(handoffPath)) {
      handoffContent = fs.readFileSync(handoffPath, "utf-8");
      const parsed = matter(handoffContent);
      handoffData = parsed.data as Partial<HandoffFrontmatter>;
      core.info(
        `Current handoff state — agent: ${handoffData.last_agent}, ` +
          `status: ${handoffData.status}, phase: ${handoffData.current_phase}`
      );
    } else {
      core.info("No HANDOFF.md found. Will create one.");
      handoffContent = matter.stringify(
        "\n## What Was Completed\n\n## Next Steps\n\n## Files Modified/Created\n\n## Build Status\n",
        {
          last_agent: "github-action",
          timestamp: new Date().toISOString(),
          status: "in-progress",
          current_phase: "Unknown",
          current_task: "Unknown",
          stop_reason: "automated",
        }
      );
    }

    // -----------------------------------------------------------------------
    // 6. Update HANDOFF.md
    // -----------------------------------------------------------------------
    const updatedHandoff = updateHandoff(
      handoffContent,
      changedFiles,
      prTitle,
      prNumber
    );

    fs.writeFileSync(handoffPath, updatedHandoff, "utf-8");
    core.info("Updated HANDOFF.md with PR context");

    // Re-parse for comment building
    const updatedHandoffParsed = matter(updatedHandoff);
    handoffData = updatedHandoffParsed.data as Partial<HandoffFrontmatter>;

    // -----------------------------------------------------------------------
    // 7. Auto-update PROGRESS.md (if enabled)
    // -----------------------------------------------------------------------
    let completedTasks: string[] = [];
    let phases: ProgressPhase[] = [];
    const progressPath = path.join(syncPath, "PROGRESS.md");

    if (autoProgress && fs.existsSync(progressPath)) {
      const progressContent = fs.readFileSync(progressPath, "utf-8");
      const result = autoUpdateProgress(progressContent, changedFilenames);

      completedTasks = result.completedTasks;
      phases = parseProgress(result.updatedContent);

      if (completedTasks.length > 0) {
        fs.writeFileSync(progressPath, result.updatedContent, "utf-8");
        core.info(
          `Auto-completed ${completedTasks.length} task(s) in PROGRESS.md:`
        );
        for (const task of completedTasks) {
          core.info(`  - ${task}`);
        }
      } else {
        core.info(
          "No tasks in PROGRESS.md matched changed files. No updates needed."
        );
        phases = parseProgress(progressContent);
      }
    } else if (autoProgress) {
      core.info("No PROGRESS.md found. Skipping auto-progress update.");
    }

    // -----------------------------------------------------------------------
    // 8. Post or update PR comment (if enabled)
    // -----------------------------------------------------------------------
    if (postComment) {
      const commentBody = buildCommentBody(phases, completedTasks, handoffData);
      const commentMarker = "<!-- ai-sync-status -->";
      const fullComment = `${commentMarker}\n${commentBody}`;

      // Check for an existing ai-sync comment to update
      let existingCommentId: number | null = null;

      const commentsResponse = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: prNumber,
        per_page: 100,
      });

      for (const existingComment of commentsResponse.data) {
        if (existingComment.body?.includes(commentMarker)) {
          existingCommentId = existingComment.id;
          break;
        }
      }

      if (existingCommentId) {
        await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: existingCommentId,
          body: fullComment,
        });
        core.info(`Updated existing AI Sync comment (ID: ${existingCommentId})`);
      } else {
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: fullComment,
        });
        core.info("Created AI Sync status comment on PR");
      }
    }

    // -----------------------------------------------------------------------
    // 9. Commit and push changes (if any files were modified)
    // -----------------------------------------------------------------------
    const statusOutput = await git("status", "--porcelain", syncDir);

    if (statusOutput.length > 0) {
      core.info("Committing .ai-sync/ changes...");

      // Configure git for the action
      await git(
        "config",
        "user.name",
        "github-actions[bot]"
      );
      await git(
        "config",
        "user.email",
        "41898282+github-actions[bot]@users.noreply.github.com"
      );

      // Stage .ai-sync/ files
      await git("add", syncDir);

      // Commit with [skip ci] to avoid recursive triggers
      await git(
        "commit",
        "-m",
        "chore: auto-update .ai-sync/ state [skip ci]"
      );

      // Push to the PR branch
      await git("push", "origin", `HEAD:${prBranch}`);

      core.info(`Pushed .ai-sync/ updates to branch: ${prBranch}`);
    } else {
      core.info("No changes to .ai-sync/ files. Nothing to commit.");
    }

    // -----------------------------------------------------------------------
    // Set outputs
    // -----------------------------------------------------------------------
    core.setOutput("tasks-completed", completedTasks.length.toString());
    core.setOutput(
      "tasks-completed-list",
      JSON.stringify(completedTasks)
    );
    core.setOutput(
      "total-progress",
      phases.reduce((s, p) => s + p.tasks.filter((t) => t.checked).length, 0).toString()
    );
    core.setOutput(
      "total-tasks",
      phases.reduce((s, p) => s + p.tasks.length, 0).toString()
    );

    core.info("AI Sync Action completed successfully.");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`AI Sync Action failed: ${error.message}`);
    } else {
      core.setFailed("AI Sync Action failed with an unknown error");
    }
  }
}

run();
