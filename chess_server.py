from flask import Flask, jsonify, request
import os
import chess, chess.engine

app = Flask(__name__)

def algebraic_to_fen(algebraic_notation):
    board = chess.Board()
    moves = algebraic_notation.split()

    for move in moves:
        board.push_san(move)

    return board.fen()

def get_best_move(fen, depth, discrete):
    board = chess.Board(fen)
    stockfish_path = os.getenv("STOCKFISH_PATH", "PATH_TO_STOCKFISH")
    engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
    try:
        if not discrete:
            result = engine.play(board, chess.engine.Limit(time=depth))
            return result.move

        analyse = engine.analyse(board, chess.engine.Limit(time=depth), multipv=3)
        return [result["pv"][0].uci() for result in analyse]
    finally:
        engine.quit()


@app.route('/', methods=['GET'])
def index():
    return 'MeanChess API is running. Use /api?algebra=<moves>&depth=<seconds>&discrete=0', 200

@app.route('/api', methods=['GET'])
def api():
    algebraic_notation = request.args.get("algebra")
    depth = request.args.get("depth")
    discrete = int(request.args.get("discrete"))

    best_move = get_best_move(algebraic_to_fen(algebraic_notation), float(depth), discrete)
    if not discrete:
        best_move = str(best_move)
        best_move = best_move[:2] + ' ' + best_move[2:]
        return best_move

    elif discrete:
        return jsonify(best_move)

if __name__ == "__main__":
    app.run()
