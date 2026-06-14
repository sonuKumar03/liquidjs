# Upstream Merge Task

## Objective

Merge the current SpotDraft LiquidJS fork with upstream LiquidJS while preserving all SpotDraft-specific functionality.

Focus on:

* Computation correctness
* Validation
* Static analysis
* Future LSP support

Ignore:

* Shopify theme compatibility
* Rendering improvements
* Layout/include/render features

---

## Custom Features To Preserve (Determine Based on the Current State of the Local Project)

The exact set of SpotDraft-specific features has not yet been fully identified and must be determined during the investigation phase. As part of the merge process, create an inventory of all fork-specific functionality and ensure that any required behavior is preserved after migration. Document each discovered feature in the progress file and validate that it continues to work in the merged implementation.

Do not remove custom behavior simply because upstream implements a similar feature.

---

## Agent Workflow

1. Investigate divergence.
2. Create a task list in `.ai/upstream-merge-progress.md`.
3. Track progress using TODO / IN_PROGRESS / DONE / BLOCKED.
4. Resolve conflicts incrementally.
5. Commit progress regularly.
6. Update progress after every major decision.
7. Produce a final migration report.

---

## Discover Local Changes

Find fork-only commits:

```bash
git log --oneline upstream/master..HEAD
```

Inspect fork changes:

```bash
BASE=$(git merge-base HEAD upstream/master)

git diff --stat $BASE..HEAD
git diff --name-only $BASE..HEAD
```

Inspect fork history:

```bash
git log --stat upstream/master..HEAD
```

Inspect custom implementation history:

```bash
git log --follow -p -- <file>
```

---

## Search For Custom Features

```bash
git grep -n "parseAssign"
git grep -n "computeColumn"
git grep -n "currency"
git grep -n "duration"
git grep -n "date"
git grep -n "dependency"
git grep -n "undefined"
```

Inspect arithmetic implementations:

```bash
git grep -n "plus"
git grep -n "minus"
git grep -n "times"
git grep -n "divided_by"
```

---

## Discover Upstream Changes

```bash
git remote add upstream https://github.com/harttle/liquidjs.git || true
git fetch upstream

BASE=$(git merge-base HEAD upstream/master)

git rev-list --left-right --count upstream/master...HEAD

git diff --stat upstream/master...HEAD

git log --oneline HEAD..upstream/master
```

Inspect likely LSP-relevant areas:

```bash
git log --stat upstream/master -- src/parser
git log --stat upstream/master -- src/tokens
git log --stat upstream/master -- src/context
```

---

## Merge Hotspots

Find files modified by both sides:

```bash
comm -12 \
 <(git diff --name-only $BASE..HEAD | sort) \
 <(git diff --name-only $BASE..upstream/master | sort)
```

Treat these files as high-risk.

---

## Conflict Resolution Rules

Before resolving any conflict:

1. Identify what the fork added.
2. Identify what upstream changed.
3. Preserve business behavior.
4. Prefer upstream architecture when possible.
5. Port custom behavior into the new structure.

Do not blindly choose ours/theirs.

---

## Progress File

Create:

```txt
.ai/upstream-merge-progress.md
```

Track tasks discovered during investigation.

Example:

```md
| Status | Task | Notes |
|----------|----------|----------|
| DONE | Measure divergence | 1056 upstream commits |
| IN_PROGRESS | Resolve arithmetic conflicts | plus/minus/times |
| TODO | Validate parseAssign | pending |
```

---

## Deliverables

Provide:

1. Divergence summary
2. Merge hotspots
3. Upstream improvements adopted
4. Custom features preserved
5. Remaining risks
6. Final recommendation

State whether the branch is:

* Ready for testing
* Ready for review
* Requires additional migration work

```
```
