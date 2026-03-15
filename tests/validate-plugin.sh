#!/usr/bin/env bash
# validate-plugin.sh — Validate ai-sync plugin structure, JSON, frontmatter, and cross-references
set -uo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0
WARN=0

pass() { PASS=$((PASS + 1)); echo "  PASS  $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL  $1"; }
warn() { WARN=$((WARN + 1)); echo "  WARN  $1"; }

echo "=== ai-sync Plugin Validation ==="
echo "Plugin dir: $PLUGIN_DIR"
echo ""

# ─── 1. Required files exist ───
echo "--- Structure ---"

required_files=(
  ".claude-plugin/plugin.json"
  "hooks/hooks.json"
  "commands/sync-init.md"
  "commands/handoff.md"
  "commands/sync-status.md"
  "commands/sync-resume.md"
  "commands/sync-diff.md"
  "commands/sync-adapter.md"
  "commands/sync-transfer.md"
  "commands/sync-hooks.md"
  "skills/ai-sync-protocol/SKILL.md"
  "README.md"
  "LICENSE"
  "CONTRIBUTING.md"
  "CLAUDE.md"
)

for f in "${required_files[@]}"; do
  if [[ -f "$PLUGIN_DIR/$f" ]]; then
    pass "$f exists"
  else
    fail "$f missing"
  fi
done

# ─── 2. JSON validation ───
echo ""
echo "--- JSON Validity ---"

json_files=(
  ".claude-plugin/plugin.json"
  "hooks/hooks.json"
)

for f in "${json_files[@]}"; do
  filepath="$PLUGIN_DIR/$f"
  if [[ -f "$filepath" ]]; then
    if node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$filepath" 2>/dev/null; then
      pass "$f is valid JSON"
    else
      fail "$f is invalid JSON"
    fi
  fi
done

# ─── 3. Plugin manifest fields ───
echo ""
echo "--- Plugin Manifest ---"

manifest="$PLUGIN_DIR/.claude-plugin/plugin.json"
if [[ -f "$manifest" ]]; then
  for field in name version description author license; do
    if node -e "const d=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); if(!(process.argv[2] in d)) process.exit(1)" "$manifest" "$field" 2>/dev/null; then
      pass "plugin.json has '$field'"
    else
      fail "plugin.json missing '$field'"
    fi
  done
fi

# ─── 4. Command frontmatter validation ───
echo ""
echo "--- Command Frontmatter ---"

for cmd in "$PLUGIN_DIR"/commands/*.md; do
  bname="$(basename "$cmd")"
  # Check starts with ---
  if head -1 "$cmd" | grep -q "^---"; then
    pass "$bname has frontmatter delimiter"
  else
    fail "$bname missing frontmatter (no leading ---)"
    continue
  fi

  # Check has description field
  if grep -q "^description:" "$cmd"; then
    pass "$bname has 'description' field"
  else
    fail "$bname missing 'description' in frontmatter"
  fi

  # Check has allowed-tools field
  if grep -q "^allowed-tools:" "$cmd"; then
    pass "$bname has 'allowed-tools' field"
  else
    fail "$bname missing 'allowed-tools' in frontmatter"
  fi
done

# ─── 5. Skill frontmatter validation ───
echo ""
echo "--- Skill Frontmatter ---"

skill="$PLUGIN_DIR/skills/ai-sync-protocol/SKILL.md"
if [[ -f "$skill" ]]; then
  for field in name description version; do
    if grep -q "^${field}:" "$skill"; then
      pass "SKILL.md has '$field'"
    else
      fail "SKILL.md missing '$field'"
    fi
  done
fi

# ─── 6. Hooks validation ───
echo ""
echo "--- Hooks ---"

hooks="$PLUGIN_DIR/hooks/hooks.json"
if [[ -f "$hooks" ]]; then
  for hook in SessionStart Stop; do
    if node -e "const d=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); if(!(process.argv[2] in (d.hooks||{}))) process.exit(1)" "$hooks" "$hook" 2>/dev/null; then
      pass "hooks.json has '$hook' hook"
    else
      warn "hooks.json missing '$hook' hook"
    fi
  done
fi

# ─── 7. Cross-reference: commands listed in SKILL.md ───
echo ""
echo "--- Cross-References ---"

# Extract command names from SKILL.md (lines containing `/command-name`)
seen_cmds=()
while IFS= read -r cmd_name; do
  # Deduplicate
  already_seen=false
  for s in "${seen_cmds[@]+"${seen_cmds[@]}"}"; do
    if [[ "$s" == "$cmd_name" ]]; then
      already_seen=true
      break
    fi
  done
  if $already_seen; then continue; fi
  seen_cmds+=("$cmd_name")

  if [[ -f "$PLUGIN_DIR/commands/${cmd_name}.md" ]]; then
    pass "SKILL.md references /$cmd_name → commands/${cmd_name}.md exists"
  else
    fail "SKILL.md references /$cmd_name but commands/${cmd_name}.md not found"
  fi
done < <(grep -oE '`/[a-z][-a-z]*`' "$skill" 2>/dev/null | tr -d '`' | sed 's|^/||' | sort -u)

# ─── 8. All command files referenced in README ───
echo ""
echo "--- README References ---"

readme="$PLUGIN_DIR/README.md"
if [[ -f "$readme" ]]; then
  for cmd in "$PLUGIN_DIR"/commands/*.md; do
    bname="$(basename "$cmd" .md)"
    if grep -q "$bname" "$readme"; then
      pass "README mentions $bname"
    else
      warn "README does not mention $bname"
    fi
  done
fi

# ─── 9. Adapter consistency ───
echo ""
echo "--- Adapter Consistency ---"

adapter_cmd="$PLUGIN_DIR/commands/sync-adapter.md"
if [[ -f "$adapter_cmd" ]]; then
  for tool in cursor cline windsurf aider copilot continue; do
    if grep -qi "$tool" "$adapter_cmd"; then
      pass "sync-adapter.md covers $tool"
    else
      warn "sync-adapter.md does not mention $tool"
    fi
  done
fi

# ─── Summary ───
echo ""
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Warnings: $WARN"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo "VALIDATION FAILED — $FAIL issue(s) found"
  exit 1
else
  echo "VALIDATION PASSED"
  exit 0
fi
