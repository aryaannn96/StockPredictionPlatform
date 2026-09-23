import yfinance as yf


def fetch_stock_data(symbol, period="1y"):
    print(f"Fetching data for {symbol}...")

    stock = yf.Ticker(symbol)

    data = stock.history(period=period)

    if data.empty:
        raise ValueError(f"No data found for {symbol}")

    data = data.reset_index()

    return data


if __name__ == "__main__":
    symbol = "AAPL"

    data = fetch_stock_data(symbol)

    print("\nLatest stock data:")
    print(data.tail())

    print(f"\nTotal records: {len(data)}")