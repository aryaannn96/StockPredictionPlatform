from flask import Flask, jsonify
from flask_cors import CORS

from predictor import predict_next_price
from model import train_model
from data_fetcher import fetch_stock_data

app = Flask(__name__)
CORS(app)


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return jsonify({
        "service": "Stock Prediction ML Service",
        "status": "running"
    })


# ============================================================
# HEALTH
# ============================================================

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })


# ============================================================
# PREDICTION
# ============================================================

@app.route("/predict/<symbol>")
def prediction(symbol):

    try:
        symbol = symbol.upper()

        result = predict_next_price(symbol)

        return jsonify(result)

    except Exception as e:

        print("Prediction error:", repr(e))

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# SIGNAL
# ============================================================

@app.route("/signal/<symbol>")
def signal(symbol):

    try:

        symbol = symbol.upper()

        # Get prediction result from ML model
        result = predict_next_price(symbol)

        current_price = float(
            result["currentPrice"]
        )

        predicted_price = float(
            result["predictedPrice"]
        )

        predicted_return = float(
            result["predictedReturn"]
        )

        # ====================================================
        # GENERATE BUY / HOLD / SELL SIGNAL
        # ====================================================

        if predicted_return >= 2:

            signal_value = "BUY"

        elif predicted_return <= -2:

            signal_value = "SELL"

        else:

            signal_value = "HOLD"

        # ====================================================
        # CONFIDENCE
        # ====================================================

        confidence = min(
            95,
            max(
                50,
                50 + abs(predicted_return) * 10
            )
        )

        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "symbol": symbol,

            "currentPrice": round(
                current_price,
                2
            ),

            "predictedPrice": round(
                predicted_price,
                2
            ),

            "changePercent": round(
                predicted_return,
                2
            ),

            "signal": signal_value,

            "confidence": round(
                confidence,
                2
            ),

            "model": "Random Forest",

            "mae": result.get(
                "mae",
                None
            ),

            "rmse": result.get(
                "rmse",
                None
            )

        })

    except Exception as e:

        print("Signal error:", repr(e))

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# HISTORICAL DATA
# ============================================================

@app.route("/history/<symbol>")
def history(symbol):

    try:

        symbol = symbol.upper()

        data = fetch_stock_data(
            symbol,
            period="1mo"
        )

        if data is None or data.empty:

            return jsonify({
                "symbol": symbol,
                "history": []
            })

        history_data = []

        for index, row in data.iterrows():

            # ----------------------------------------------
            # Safely convert date
            # ----------------------------------------------

            if hasattr(index, "to_pydatetime"):

                date_value = (
                    index
                    .to_pydatetime()
                    .isoformat()
                )

            elif hasattr(index, "isoformat"):

                date_value = index.isoformat()

            else:

                date_value = str(index)

            # ----------------------------------------------
            # Get closing price
            # ----------------------------------------------

            close_value = row["Close"]

            if hasattr(close_value, "item"):

                close_value = close_value.item()

            history_data.append({

                "date": date_value,

                "close": round(
                    float(close_value),
                    2
                )

            })

        return jsonify({

            "symbol": symbol,

            "history": history_data

        })

    except Exception as e:

        print(
            "History error:",
            repr(e)
        )

        return jsonify({

            "error": str(e)

        }), 500


# ============================================================
# MODEL EVALUATION
# ============================================================

@app.route("/evaluate/<symbol>", methods=["GET"])
def evaluate(symbol):

    try:

        symbol = symbol.upper()

        result = train_model(symbol)

        response = {

            "symbol":
                result["symbol"],

            "mae":
                result["mae"],

            "rmse":
                result["rmse"],

            "trainingRecords":
                result["trainingRecords"],

            "testingRecords":
                result["testingRecords"],

            "evaluation":
                result["evaluation"]

        }

        # ====================================================
        # FEATURE IMPORTANCE
        # ====================================================
        #
        # This will be available after we add
        # featureImportance to model.py.
        #
        # Using .get() keeps this endpoint compatible
        # even before that change.
        # ====================================================

        if "featureImportance" in result:

            response["featureImportance"] = (
                result["featureImportance"]
            )

        return jsonify(response)

    except Exception as e:

        print(
            "Evaluation error:",
            repr(e)
        )

        return jsonify({

            "error": str(e)

        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )