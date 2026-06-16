---
name: sourcegraph-nav
description: Navigate code using Sourcegraph to find where symbols are defined and where they're used. Use this when you need to jump to a definition or find all references to a function, class, or variable.
allowed-tools: mcp__sourcegraph__go_to_definition,mcp__sourcegraph__find_references
---

# Sourcegraph Code Navigation

Use this skill to precisely navigate the codebase and understand how code is connected.

## When to Use

- **"Where is X defined?"** → Use `go_to_definition`
- **"Where is X used?"** or **"Find all references to X"** → Use `find_references`
- **Understanding code flow** → Chain these tools to trace how functions call each other
- **Impact analysis** → Before refactoring, use `find_references` to see all affected code

## Tools Available

**go_to_definition**: Jump to where a symbol (function, class, variable) is defined
- Required: repo, path, symbol
- Optional: revision (defaults to HEAD)
- Returns: File location and code snippet showing the definition

**find_references**: Find all places where a symbol is used
- Required: repo, path, symbol
- Optional: revision, limit (defaults to 10, **always set to 150** for comprehensive results)
- Returns: List of all usages with context
- **Anchor at the definition site**, not a usage site. Run `go_to_definition` first, then call `find_references` against the file/repo where the symbol is *defined* — this is what yields complete cross-repo results. Calling it against a usage site can return partial results.

## Why Use Sourcegraph Over Grep

- **Accurate**: Understands code syntax, no false matches in strings/comments
- **Fast**: Indexed searching, instant results even on large codebases
- **Cross-file**: Automatically traces imports and dependencies
- **Safe**: Perfect for refactoring analysis—see exact impact before making changes

## Start From What You Already Have

If the user's IDE selection, an open file, or earlier context already references the
symbol, you already have a `path` to navigate from — go straight to `go_to_definition`.
Do **not** run a search (e.g. `keyword_search`) first just to locate the symbol; that's a
wasted round-trip.

## Example Workflow

1. User asks: "Where is `get_logger` defined?"
   → Call `go_to_definition` with symbol="get_logger" (use the path you already have)

2. User asks: "Where is it used?"
   → Take the definition's file/repo from step 1, then call `find_references` with
     symbol="get_logger", limit=150 (anchored at the definition site)

3. User asks: "Show me all the files that call this function"
   → Use `find_references` and summarize the results by file