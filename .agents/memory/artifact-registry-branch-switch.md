---
name: Artifact registry and branch switches
description: Recovery behavior when switching Git branches temporarily removes artifact and workflow registrations.
---

**Rule:** Avoid changing the active branch to one without artifact manifests when possible. If a branch switch removes registrations, restore the artifact-containing branch and restart the exact existing artifact-managed workflow; this may trigger artifact and workflow auto-registration. Verify with the artifact/workflow lists and a preview.

**Why:** In this workspace, switching to a branch without artifact directories removed their registrations. Restoring the code branch alone left the registry empty until the existing web workflow was restarted, after which the artifacts and workflows returned.

**How to apply:** When reviewing a PR on another branch, prefer reading its commit diff or using a separate worktree. If switching branches causes this issue, restore the original branch before restarting a managed workflow. Do not recreate artifact directories unless platform actions require it.
