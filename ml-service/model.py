from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

from data_fetcher import fetch_stock_data
from data_preprocessor import prepare_data


# =========================
# FEATURES
# =========================

FEATURES = [
    "Open",
    "High",
    "Low",
    "Close",
    "Volume",
    "SMA_20",
    "SMA_50",
    "EMA_20",
    "RSI",
    "MACD",
    "MACD_Signal",
    "Daily_Return",
    "Volatility",
    "Volume_SMA_20"
]


# =========================
# TRAIN MODEL
# =========================

def train_model(symbol="AAPL"):

    # Fetch historical data
    data = fetch_stock_data(
        symbol,
        period="1y"
    )

    # Prepare data
    data = prepare_data(data)

    # =========================
    # FEATURES & TARGET
    # =========================

    X = data[FEATURES]

    # Target is next-day percentage return
    y = data["Target_Return"]

    # =========================
    # TRAIN / TEST SPLIT
    # =========================

    split_index = int(
        len(data) * 0.8
    )

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    # =========================
    # RANDOM FOREST
    # =========================

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        n_jobs=-1
    )

    # Train model
    model.fit(
        X_train,
        y_train
    )

    # =========================
    # PREDICT RETURNS
    # =========================

    predicted_returns = model.predict(
        X_test
    )

    # =========================
    # CONVERT RETURNS TO PRICES
    # =========================

    current_prices = data[
        "Close"
    ].iloc[
        split_index:
    ].values

    actual_prices = (
        current_prices *
        (1 + y_test.values)
    )

    predicted_prices = (
        current_prices *
        (1 + predicted_returns)
    )

    # =========================
    # EVALUATION
    # =========================

    mae = mean_absolute_error(
        actual_prices,
        predicted_prices
    )

    rmse = np.sqrt(
        mean_squared_error(
            actual_prices,
            predicted_prices
        )
    )

    # =========================
    # OUTPUT
    # =========================

    print("\nModel Training Complete")
    print("-----------------------")

    print(
        f"Stock: {symbol}"
    )

    print(
        f"Training records: "
        f"{len(X_train)}"
    )

    print(
        f"Testing records: "
        f"{len(X_test)}"
    )

    print(
        f"Features used: "
        f"{len(FEATURES)}"
    )

    print(
        f"MAE: {mae:.2f}"
    )

    print(
        f"RMSE: {rmse:.2f}"
    )

    # =========================
    # FEATURE IMPORTANCE
    # =========================

    print("\nFeature Importance")
    print("-----------------------")

    importance = list(
        zip(
            FEATURES,
            model.feature_importances_
        )
    )

    importance.sort(
        key=lambda x: x[1],
        reverse=True
    )

    # JSON-friendly feature importance
    feature_importance = []

    for feature, value in importance:

        print(
            f"{feature:18} "
            f"{value:.4f}"
        )

        feature_importance.append({
            "feature": feature,
            "importance": round(
                float(value),
                4
            )
        })

    # =========================
    # EVALUATION DATA
    # =========================

    evaluation_data = []

    test_dates = data[
        "Date"
    ].iloc[
        split_index:
    ]

    for date, current, actual, predicted, ret in zip(
        test_dates,
        current_prices,
        actual_prices,
        predicted_prices,
        predicted_returns
    ):

        evaluation_data.append({

            "date": str(date)[:10],

            "currentPrice": round(
                float(current),
                2
            ),

            "actual": round(
                float(actual),
                2
            ),

            "predicted": round(
                float(predicted),
                2
            ),

            "predictedReturn": round(
                float(ret * 100),
                2
            )
        })

    # =========================
    # RETURN RESULTS
    # =========================

    return {

        "model": model,

        "symbol": symbol,

        "mae": round(
            float(mae),
            2
        ),

        "rmse": round(
            float(rmse),
            2
        ),

        "trainingRecords": len(
            X_train
        ),

        "testingRecords": len(
            X_test
        ),

        "evaluation": evaluation_data,

        "features": FEATURES,

        # NEW
        "featureImportance": feature_importance
    }


# =========================
# TEST
# =========================

if __name__ == "__main__":

    result = train_model(
        "AAPL"
    )

    print("\nEvaluation Sample")
    print("-----------------")

    for item in result[
        "evaluation"
    ][:5]:

        print(item)

    print("\nFeature Importance Sample")
    print("-------------------------")

    for item in result[
        "featureImportance"
    ]:

        print(item)