from flask import Flask, request
import os
import chess
import chess.engine

app = Flask(__name__)


def _normalize_move_token(token):
    return token.strip().strip("\"'")


def apply_move_list(board, move_text):
    """Apply a SAN/ UCI move list to a board, ignoring malformed tokens."""
    if not move_text:
        return board

    for raw_token in move_text.split():
        token = _normalize_move_token(raw_token)
        if not token:
            continue

        try:
            board.push_san(token)
            continue
        except ValueError:
            pass

        try:
            board.push_uci(token)
        except ValueError as exc:
            raise ValueError(f"Invalid move token: {raw_token!r}") from exc

    return board


def algebraic_to_fen(algebraic_notation):
    board = chess.Board()
    apply_move_list(board, algebraic_notation)
    return board.fen()


def get_best_move(fen, depth, discrete):
    board = chess.Board(fen)
    stockfish_path = os.getenv("STOCKFISH_PATH", "PATH_TO_STOCKFISH")

    with chess.engine.SimpleEngine.popen_uci(stockfish_path) as engine:
        if not discrete:
            result = engine.play(board, chess.engine.Limit(time=depth))
            return result.move

        analysis = engine.analyse(board, chess.engine.Limit(time=depth), multipv=2)
        return [entry["pv"][0].uci() for entry in analysis if entry.get("pv")]


@app.route('/', methods=['GET'])
def index():
    return 'MeanChess API is running. Use /api?algebra=<moves>&depth=<seconds>&discrete=0', 200


DEFAULT_DEPTH_SECONDS = 0.7


@app.route('/api', methods=['GET'])
def api():
    """Return Stockfish guidance with optional query params.

    Zero-input mode:
    - /api with no query params analyzes the starting chess position.
    - Optional params still work for custom positions/depth.
    """
    algebraic_notation = request.args.get("algebra", "")
    depth = float(request.args.get("depth", str(DEFAULT_DEPTH_SECONDS)))
    discrete = int(request.args.get("discrete", "0"))

    best_move = get_best_move(algebraic_to_fen(algebraic_notation), depth, discrete)
    if not discrete:
        best_move = str(best_move)
        return best_move[:2] + ' ' + best_move[2:]

    return best_move


if __name__ == "__main__":
    app.run()
