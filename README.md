# MeanChess
Tampermonkey script for Lichess that sends each post-opponent position to GitHub Actions and prints top Stockfish lines in the workflow log.

## What it does
After your opponent moves, the userscript automatically sends the game move history to a GitHub Actions workflow. The workflow rebuilds the position, runs Stockfish with MultiPV=3, and logs output like:

```text
Opponent:    Samyakchourasia
Current move:26
FEN:         r4rk1/pp3ppp/2p1pn2/3p4/3P4/2P1P1P1/PP3PBP/2R1R1K1 b - - 0 26
STOCKFISH    26... Qf7    +0.9
ALTERNATIVE  26... Re7    +0.1
ALT #2       26... Rf8    -0.2
Link: https://lichess.org/24a85lUX
```

## Setup
1. Fork or push this repo to your own GitHub account.
2. Create a Personal Access Token (classic is fine) with at least **repo** and **workflow** scopes.
3. Open `meanChess.js` and set:
   - `owner`
   - `repo`
   - `eventType` (default: `analyze-position`)
   - `githubToken` (token value itself)
   - optional: `depthSeconds`, `pollMs` (recommended for blitz: `depthSeconds: '0.7'`)
4. Install/update `meanChess.js` in Tampermonkey.
5. Open a Lichess game while logged in.

Now every time your opponent completes a move (and it becomes your turn), the script dispatches the workflow.

The workflow keeps only one manual input: `depth`.
All position/game data (`algebra`, `opponent`, `current_move`, `game_url`) is sent directly by Tampermonkey through `repository_dispatch` payload.

## GitHub Actions workflow
Workflow file: `.github/workflows/tampermonkey-api.yml`

It:
1. Installs Python deps + Stockfish.
2. Recreates the position from SAN move history.
3. Analyzes with MultiPV=3.
4. Prints best move + two alternatives with evals.

## Local API mode (legacy)
`chess_server.py` is still included if you want to run local Flask + Stockfish manually, but the userscript is now focused on GitHub Actions dispatch mode.


## Exactly what you need to do (quick)
1. Open `meanChess.js`.
2. Replace these placeholders in `CONFIG`:
   - `owner: 'YOUR_GITHUB_USERNAME'`
   - `repo: 'YOUR_REPO_NAME'`
   - `githubToken: 'YOUR_GITHUB_PAT'`
3. Keep `depthSeconds: '0.7'` for blitz (fast response).
4. Save script in Tampermonkey and enable it.
5. Open a Lichess game (logged in).
6. After every opponent move, check GitHub Actions logs for:
   - `STOCKFISH`
   - `ALTERNATIVE`
   - `ALT #2`

If you want even faster but weaker suggestions, set `depthSeconds` to `0.5`.

## About your `GH` secret (important)
If your token is saved in GitHub Secrets as `GH`, that secret is only visible **inside GitHub Actions runtime**. The browser userscript on `lichess.org` cannot read repo secrets directly.

So for dispatching workflows from Tampermonkey, you must provide:
- `owner`: GitHub API needs to know which account/org repo to call.
- `repo`: GitHub API needs the exact target repository.
- `githubToken`: Authorization for `repository_dispatch` API call.

In short: secret name `GH` is not enough in browser. You must use the token **value** in Tampermonkey (or route through your own backend/proxy).


## Why config is needed
The userscript calls GitHub's API endpoint:
`POST /repos/{owner}/{repo}/dispatches`

So it must know:
- `owner`: which account/org owns the repo.
- `repo`: which repo contains the workflow.
- `githubToken`: auth token allowed to trigger `repository_dispatch`.

Without these, GitHub cannot know where to send the request and will reject it.

## Can I just put `GH` (secret name) in config?
No. `GH` is only a secret **name** inside GitHub Actions runtime. Tampermonkey runs in your browser on lichess.org and cannot read GitHub repo secrets.

So:
- `githubToken: 'GH'` will not work.
- You must either use the actual token value in Tampermonkey, **or** build your own backend/proxy that holds the token server-side and accepts safe requests from the script.
