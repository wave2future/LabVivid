#!/usr/bin/env bash
# Auto-commit & push working changes when Claude stops.
# Resilient by design: no-op on a clean tree, never blocks stopping, and
# treats the push as best-effort so an offline/credential failure still
# leaves a good local commit. Always exits 0.
set +e

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Nothing changed -> nothing to do.
[ -z "$(git status --porcelain)" ] && exit 0

git add -A
ts="$(date '+%Y-%m-%d %H:%M:%S')"
git commit -q -m "chore: auto-commit changes ($ts)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" >/dev/null 2>&1

# Best-effort push of the current branch; failures never break the hook.
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
[ -n "$branch" ] && git push origin "$branch" >/dev/null 2>&1

exit 0
