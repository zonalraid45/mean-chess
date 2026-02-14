# MeanChess
Single-arrow best-move suggestion overlay for Lichess.

## Install
* The code in `meanChess.js` is a Tampermonkey userscript. 
* `chess_server.py` is a Flask server using `python-chess` for chess programming utilities. Run it using `python chess_server.py`. Before doing so, run `pip install -r requirements.txt`. Change `PATH_TO_STOCKFISH` to your local Stockfish engine.


## Run with GitHub Actions + Tampermonkey (phone-friendly)
1. Push this repo to your own GitHub account.
2. Open **Actions** -> **Temporary API for Tampermonkey** -> **Run workflow**.
3. After it starts, open job logs and copy the printed `https://...trycloudflare.com` URL.
4. In Tampermonkey, install/update `meanChess.js`.
5. Open Lichess, paste that URL into **API URL** in the control box, then tap **Show Best Move**.

Notes:
- You do not type chess moves manually; the userscript reads move history directly from the board.
- The Actions URL is temporary and expires when the workflow ends.
- Re-run workflow whenever the URL expires.

## Run locally (optional)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Install Stockfish and set environment variable:
   ```bash
   export STOCKFISH_PATH=/path/to/stockfish
   ```
3. Start the API server:
   ```bash
   python chess_server.py
   ```
4. In Tampermonkey keep API URL empty (defaults to `http://127.0.0.1:5000`).

## Phone note
For phone usage, easiest is running the included GitHub Actions workflow to get a temporary public API URL. You still do **not** type moves manually.

## Usage
The control panel appears at the bottom of the page during a Lichess game. Click **Show Best Move** to draw a single arrow for the engine's top move in the current position.

MeanChess does not work when playing anonymously.

## Bugs
1. If the arrow feels stale after many premoves, click **Show Best Move** again to refresh it.
2. Arrows may not have arrowheads. Solution: Draw an arrow.
3. The first suggestion might show best move for opponent. This only happens once.

The mentioned bugs occur in Chrome, and I have yet to see 1 and 2 in Firefox and Firefox forks.

## Depth recommendation
Based on time vs. best move trade-offs.
| Gamemode | Depth |
| ------:| -----------:|
| Bullet       | 0.1 s |
| Blitz        | 1 s |
| $\geq$ Rapid | +3 s |

## Demo
[mean-chess-demo.webm](https://github.com/sanglantes/mean-chess/assets/101125878/942a80c3-8ea4-4c80-91e6-7f7392106fe3)

