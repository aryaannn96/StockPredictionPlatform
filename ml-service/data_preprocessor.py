import pandas as pd


def prepare_data(data):
    # Keep required columns
    data = data[
        ["Date", "Open", "High", "Low", "Close", "Volume"]
    ].copy()

    # Sort chronologically
    data = data.sort_values("Date").reset_index(drop=True)

    # =========================
    # TECHNICAL INDICATORS
    # =========================

    # Simple Moving Averages
    data["SMA_20"] = data["Close"].rolling(20).mean()
    data["SMA_50"] = data["Close"].rolling(50).mean()

    # Exponential Moving Average
    data["EMA_20"] = data["Close"].ewm(
        span=20,
        adjust=False
    ).mean()

    # =========================
    # RSI
    # =========================

    delta = data["Close"].diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(14).mean()
    avg_loss = loss.rolling(14).mean()

    rs = avg_gain / avg_loss

    data["RSI"] = 100 - (
        100 / (1 + rs)
    )

    # =========================
    # MACD
    # =========================

    ema_12 = data["Close"].ewm(
        span=12,
        adjust=False
    ).mean()

    ema_26 = data["Close"].ewm(
        span=26,
        adjust=False
    ).mean()

    data["MACD"] = ema_12 - ema_26

    data["MACD_Signal"] = data["MACD"].ewm(
        span=9,
        adjust=False
    ).mean()

    # =========================
    # DAILY RETURN
    # =========================

    data["Daily_Return"] = (
        data["Close"].pct_change()
    )

    # =========================
    # VOLATILITY
    # =========================

    data["Volatility"] = (
        data["Daily_Return"]
        .rolling(20)
        .std()
    )

    # =========================
    # VOLUME MOVING AVERAGE
    # =========================

    data["Volume_SMA_20"] = (
        data["Volume"]
        .rolling(20)
        .mean()
    )

    # =========================
    # NEXT-DAY RETURN
    # =========================

    data["Target_Return"] = (
        data["Close"].shift(-1)
        / data["Close"]
        - 1
    )

    # =========================
    # REMOVE INVALID ROWS
    # =========================

    data = data.dropna().reset_index(drop=True)

    return data


if __name__ == "__main__":

    from data_fetcher import fetch_stock_data

    data = fetch_stock_data(
        "AAPL",
        period="1y"
    )

    prepared_data = prepare_data(data)

    print("\nPrepared data:")
    print("-----------------------")

    print(
        prepared_data.tail()
    )

    print(
        f"\nTotal records: "
        f"{len(prepared_data)}"
    )

    print(
        "\nColumns:"
    )

    for column in prepared_data.columns:
        print(
            f"- {column}"
        )