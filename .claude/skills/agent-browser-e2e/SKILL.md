---
name: agent-browser-e2e
description: End-to-end testing workflows using agent-browser CLI, including reading login credentials from credentials.txt, navigating the app, validating UI state, and capturing evidence. Use when asked to run or describe browser automation with agent-browser, do manual QA, or verify UI changes in a live or local environment.
---

# Agent Browser E2E

## Quick Start

1. Open the app: `agent-browser open http://localhost:3000`
2. Snapshot interactive elements: `agent-browser snapshot -i`
3. Login with credentials from `credentials.txt` (see “Credentials” below)
4. Navigate to the feature under test
5. Validate with `agent-browser get value|text` and a screenshot if needed

## Credentials

- Read credentials from `credentials.txt` using the Read tool before logging in.
- Never echo or log credentials to the user. Use them only in `agent-browser fill` commands.

## Workflow (E2E)

1. **Boot app**
   - Use `bun dev` if needed, then `agent-browser open` to the correct URL.
2. **Login**
   - `agent-browser snapshot -i`
   - `agent-browser fill <emailRef> "<email>"`
   - `agent-browser fill <passwordRef> "<password>"`
   - `agent-browser click <loginButtonRef>`
3. **Navigate**
   - Use `snapshot -i` after each navigation to refresh refs.
   - Prefer explicit clicks over scrolling when possible.
4. **Execute scenario**
   - Fill inputs with `fill`, trigger actions with `click`, and wait using `agent-browser wait <ms|selector>` if needed.
5. **Validate**
   - Use `agent-browser get value <ref>` for inputs.
   - Use `agent-browser get text <ref>` for labels or headings.
   - Capture a screenshot when visual confirmation is helpful: `agent-browser screenshot --full`.

## Best Practices

- Use `snapshot -i` frequently; refs are invalid after navigation.
- Prefer `agent-browser get value|text` for assertions rather than visual inspection.
- If multiple possible flows exist, choose the most deterministic path and document it.
- Avoid hard-coded waits; use `wait <selector>` when possible.
- Keep data changes minimal (create only what’s needed for the test).

## Example Flow (Login + Form Autofill)

1. `agent-browser open http://localhost:3000`
2. `agent-browser click @signInRef`
3. `agent-browser fill @emailRef "<email>"`
4. `agent-browser fill @passwordRef "<password>"`
5. `agent-browser click @loginRef`
6. Navigate to the form, paste a URL, click autofill.
7. `agent-browser get value @nameInputRef` to confirm the autofilled name.
