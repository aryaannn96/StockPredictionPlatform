from model import train_model, FEATURES
from data_fetcher import fetch_stock_data
from data_preprocessor import prepare_data


def predict_next_price(symbol="AAPL"):

    # ==========================================
    # TRAIN MODEL
    # ==========================================

    result = train_model(symbol)

    model = result["model"]

    # ==========================================
    # FETCH LATEST DATA
    # ==========================================

    raw_data = fetch_stock_data(
        symbol,
        period="1y"
    )

    # ==========================================
    # PREPARE DATA
    # ==========================================

    data = prepare_data(raw_data)

    # ==========================================
    # GET LATEST FEATURES
    # ==========================================

    latest_data = data[
        FEATURES
    ].iloc[-1:]

    # ==========================================
    # PREDICT NEXT-DAY RETURN
    # ==========================================

    predicted_return = model.predict(
        latest_data
    )[0]

    # ==========================================
    # CURRENT PRICE
    # ==========================================

    current_price = float(
        data["Close"].iloc[-1]
    )

    # ==========================================
    # CONVERT RETURN TO PRICE
    # ==========================================

    predicted_price = (
        current_price *
        (1 + predicted_return)
    )

    # ==========================================
    # MODEL METRICS
    # ==========================================

    mae = result["mae"]
    rmse = result["rmse"]

    # ==========================================
    # PRINT RESULT
    # ==========================================

    print("\nPrediction")
    print("-----------------------")

    print(
        f"Stock: {symbol}"
    )

    print(
        f"Latest Close: "
        f"${current_price:.2f}"
    )

    print(
        f"Predicted Return: "
        f"{predicted_return * 100:.2f}%"
    )

    print(
        f"Predicted Next Close: "
        f"${predicted_price:.2f}"
    )

    print("\nModel Metrics")
    print("-----------------------")

    print(
        f"MAE: {mae:.2f}"
    )

    print(
        f"RMSE: {rmse:.2f}"
    )

    # ==========================================
    # RETURN RESULT
    # ==========================================

    return {

        "symbol": symbol,

        "currentPrice": round(
            current_price,
            2
        ),

        "predictedPrice": round(
            float(predicted_price),
            2
        ),

        "predictedReturn": round(
            float(predicted_return * 100),
            2
        ),

        "mae": mae,

        "rmse": rmse,

        "trainingRecords":
            result["trainingRecords"],

        "testingRecords":
            result["testingRecords"]
    }


# ==========================================
# TEST
# ==========================================

if __name__ == "__main__":

    result = predict_next_price(
        "AAPL"
    )

    print("\nFinal Prediction Result")
    print("-----------------------")

    print(result)