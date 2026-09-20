---
name: reverse-checkpoint
description: When the user types REVERSE, revert to the last code checkpoint using git.
---

# REVERSE Checkpoint Rule

When the user types `REVERSE` in the prompt, you MUST:
1. Understand that the user wants to revert the project codebase to the previous state.
2. The project has a local Git repository initialized for this purpose.
3. To rollback, execute `git reset --hard HEAD~1` and `git clean -fd` to remove untracked files, and return to the state of the previous commit.
4. Notify the user that the project has been successfully reverted to the previous checkpoint.
5. In order for this to be effective, before you start any new major task or make large changes, you should commit the current state: `git add . && git commit -m "Checkpoint before task..."`.
