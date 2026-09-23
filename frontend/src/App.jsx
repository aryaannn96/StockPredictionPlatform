import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8080/api";

function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [search, setSearch] = useState("AAPL");

  const [prediction, setPrediction] = useState(null);
  const [signal, setSignal] = useState(null);
  const [history, setHistory] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [modelEvaluation, setModelEvaluation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [signalLoading, setSignalLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  const [error, setError] = useState("");


  const getApiErrorMessage = (err, defaultMessage) => {
  if (!err) {
    return defaultMessage;
  }

  if (!err.response) {
    return "Unable to connect to the server. Make sure Spring Boot and the ML service are running.";
  }

  const status = err.response.status;

  const backendMessage =
    err.response.data?.error ||
    err.response.data?.message;

  if (status === 404) {
    return backendMessage ||
      "Stock symbol was not found. Please check the symbol and try again.";
  }

  if (status === 400) {
    return backendMessage ||
      "Invalid stock symbol. Please enter a valid symbol.";
  }

  if (status >= 500) {
    return backendMessage ||
      "The prediction service encountered an error. Please try again.";
  }

  return backendMessage || defaultMessage;
};

  // =========================================================
  // FETCH PREDICTION
  // =========================================================

const fetchPrediction = async (stockSymbol = symbol) => {
  try {
    setLoading(true);
    setError("");

    const upperSymbol = stockSymbol.trim().toUpperCase();

    if (!upperSymbol) {
      throw new Error("Please enter a stock symbol.");
    }

    const response = await axios.get(
      `${API_URL}/predictions/${upperSymbol}`,
      {
        timeout: 30000
      }
    );

    let data = response.data;

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        throw new Error("Invalid response received from server.");
      }
    }

    if (!data || !data.predictedPrice) {
      throw new Error(
        "Prediction data is unavailable for this stock."
      );
    }

    setPrediction(data);

  } catch (err) {
    console.error(
      "Prediction error:",
      err.response?.data || err.message
    );

    setPrediction(null);

    setError(
      err.message === "Please enter a stock symbol."
        ? err.message
        : getApiErrorMessage(
            err,
            "Unable to fetch prediction."
          )
    );

  } finally {
    setLoading(false);
  }
};
  // =========================================================
  // FETCH SIGNAL
  // =========================================================

  const fetchSignal = async (stockSymbol = symbol) => {
    try {
      setSignalLoading(true);

      const upperSymbol = stockSymbol.toUpperCase();

      const response = await axios.get(
        `${API_URL}/signals/${upperSymbol}`
      );

      setSignal(response.data);
    } catch (err) {
      console.error(
        "Signal error:",
        err.response?.data || err.message
      );

      setSignal(null);
    } finally {
      setSignalLoading(false);
    }
  };

  // =========================================================
  // FETCH HISTORY
  // =========================================================

  const fetchHistory = async (stockSymbol = symbol) => {
    try {
      setHistoryLoading(true);

      const upperSymbol = stockSymbol.toUpperCase();

      const response = await axios.get(
        `${API_URL}/history/${upperSymbol}`
      );

      console.log("History API response:", response.data);

      const data = response.data;

      const historyData = Array.isArray(data)
        ? data
        : data?.history;

      if (
        Array.isArray(historyData) &&
        historyData.length > 0
      ) {
        const cleanedHistory = historyData
          .map((item) => ({
            date: item.date,
            close: Number(item.close)
          }))
          .filter(
            (item) =>
              item.date &&
              Number.isFinite(item.close)
          );

        console.log(
          "History records loaded:",
          cleanedHistory.length
        );

        setHistory(cleanedHistory);
      } else {
        console.warn(
          "No historical data returned for:",
          upperSymbol
        );

        setHistory([]);
      }
    } catch (err) {
      console.error(
        "History API error:",
        err.response?.data || err.message
      );

      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================================================
  // FETCH MODEL EVALUATION
  // =========================================================

  const fetchModelEvaluation = async (
    stockSymbol = symbol
  ) => {
    try {
      setEvaluationLoading(true);

      const upperSymbol = stockSymbol.toUpperCase();

      const response = await axios.get(
        `${API_URL}/evaluate/${upperSymbol}`
      );

      setModelEvaluation(response.data);
    } catch (err) {
      console.error(
        "Model evaluation error:",
        err.response?.data || err.message
      );

      setModelEvaluation(null);
    } finally {
      setEvaluationLoading(false);
    }
  };

  // =========================================================
  // FETCH WATCHLIST
  // =========================================================

  const fetchStocks = async () => {
    const defaultStocks = [
      {
        id: 1,
        symbol: "AAPL",
        companyName: "Apple Inc."
      },
      {
        id: 2,
        symbol: "MSFT",
        companyName: "Microsoft Corp."
      },
      {
        id: 3,
        symbol: "GOOGL",
        companyName: "Alphabet Inc."
      },
      {
        id: 4,
        symbol: "AMZN",
        companyName: "Amazon.com Inc."
      },
      {
        id: 5,
        symbol: "NVDA",
        companyName: "NVIDIA Corp."
      },
      {
        id: 6,
        symbol: "TSLA",
        companyName: "Tesla Inc."
      }
    ];

    setStocks(defaultStocks);
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchPrediction("AAPL");
    fetchSignal("AAPL");
    fetchHistory("AAPL");
    fetchModelEvaluation("AAPL");
    fetchStocks();
  }, []);



  const refreshCurrentStock = async () => {
  if (!symbol) return;

  try {
    setRefreshing(true);
    setError("");

    await Promise.all([
      fetchPrediction(symbol),
      fetchSignal(symbol),
      fetchHistory(symbol),
      fetchModelEvaluation(symbol)
    ]);

  } catch (err) {
    console.error("Refresh error:", err);
    setError(
      getApiErrorMessage(
        err,
        "Unable to refresh stock data."
      )
    );
  } finally {
    setRefreshing(false);
  }
};

  // =========================================================
  // SEARCH
  // =========================================================

const handleSearch = async (e) => {
  e.preventDefault();

  const newSymbol = search.trim().toUpperCase();

  if (!newSymbol) {
    setError("Please enter a stock symbol.");
    return;
  }

  if (!/^[A-Z0-9.-]{1,10}$/.test(newSymbol)) {
    setError(
      "Invalid stock symbol. Use letters, numbers, dots or hyphens only."
    );
    return;
  }

  setSymbol(newSymbol);
  setSearch(newSymbol);
  setError("");

  await Promise.all([
    fetchPrediction(newSymbol),
    fetchSignal(newSymbol),
    fetchHistory(newSymbol),
    fetchModelEvaluation(newSymbol)
  ]);
};
  // =========================================================
  // CURRENT PRICE
  // =========================================================

  const currentPrice = useMemo(() => {
    if (!history.length) return null;

    const last = history[history.length - 1];

    const price = Number(last.close);

    return Number.isFinite(price) ? price : null;
  }, [history]);

  // =========================================================
  // PREDICTED PRICE
  // =========================================================

  const predictedPrice = useMemo(() => {
    if (!prediction) return null;

    const price = Number(prediction.predictedPrice);

    return Number.isFinite(price) ? price : null;
  }, [prediction]);

  // =========================================================
  // EXPECTED CHANGE
  // =========================================================

  const expectedChange = useMemo(() => {
    if (
      currentPrice === null ||
      predictedPrice === null ||
      currentPrice === 0
    ) {
      return null;
    }

    return (
      ((predictedPrice - currentPrice) /
        currentPrice) *
      100
    );
  }, [currentPrice, predictedPrice]);

  // =========================================================
  // SIGNAL TYPE
  // =========================================================

  const signalType = useMemo(() => {
    if (!signal?.signal) return "neutral";

    if (signal.signal === "BUY") return "bullish";

    if (signal.signal === "SELL") return "bearish";

    return "neutral";
  }, [signal]);


// =========================================================
// MODEL INSIGHTS
// =========================================================

const modelInsights = useMemo(() => {
  const evaluation = modelEvaluation?.evaluation;

  if (!Array.isArray(evaluation) || evaluation.length === 0) {
    return {
      directionalAccuracy: null,
      averageError: null,
      totalRecords: 0
    };
  }

  let correctDirection = 0;
  let totalError = 0;
  let validRecords = 0;

  evaluation.forEach((item) => {
    const current = Number(item.currentPrice);
    const actual = Number(item.actual);
    const predicted = Number(item.predicted);

    if (
      !Number.isFinite(current) ||
      !Number.isFinite(actual) ||
      !Number.isFinite(predicted) ||
      current === 0
    ) {
      return;
    }

    const actualDirection = actual >= current ? 1 : -1;
    const predictedDirection =
      predicted >= current ? 1 : -1;

    if (actualDirection === predictedDirection) {
      correctDirection++;
    }

    const percentageError =
      Math.abs((actual - predicted) / actual) * 100;

    if (Number.isFinite(percentageError)) {
      totalError += percentageError;
    }

    validRecords++;
  });

  if (validRecords === 0) {
    return {
      directionalAccuracy: null,
      averageError: null,
      totalRecords: 0
    };
  }

  return {
    directionalAccuracy:
      (correctDirection / validRecords) * 100,

    averageError:
      totalError / validRecords,

    totalRecords: validRecords
  };
}, [modelEvaluation]);


// =========================================================
// FEATURE IMPORTANCE
// =========================================================

const featureImportance = useMemo(() => {
  if (
    !modelEvaluation ||
    !Array.isArray(modelEvaluation.featureImportance)
  ) {
    return [];
  }

  return modelEvaluation.featureImportance
    .map((item) => ({
      feature: item.feature,
      importance: Number(item.importance)
    }))
    .filter(
      (item) =>
        item.feature &&
        Number.isFinite(item.importance)
    )
    .sort(
      (a, b) =>
        b.importance - a.importance
    );
}, [modelEvaluation]);


// =========================================================
// ACTUAL VS PREDICTED
// =========================================================

const evaluationChart = useMemo(() => {
  if (
    !modelEvaluation ||
    !Array.isArray(modelEvaluation.evaluation)
  ) {
    return null;
  }

  const data = modelEvaluation.evaluation
    .map((item) => ({
      date: item.date,
      actual: Number(item.actual),
      predicted: Number(item.predicted)
    }))
    .filter(
      (item) =>
        item.date &&
        Number.isFinite(item.actual) &&
        Number.isFinite(item.predicted)
    );

  if (!data.length) {
    return null;
  }

  const width = 900;
  const height = 360;

  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 50;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const values = data.flatMap((item) => [
    item.actual,
    item.predicted
  ]);

  let minPrice = Math.min(...values);
  let maxPrice = Math.max(...values);

  const range =
    maxPrice - minPrice || 1;

  minPrice -= range * 0.08;
  maxPrice += range * 0.08;

  const getX = (index) => {
    if (data.length === 1) {
      return (
        paddingLeft +
        chartWidth / 2
      );
    }

    return (
      paddingLeft +
      (index / (data.length - 1)) *
        chartWidth
    );
  };

  const getY = (price) => {
    return (
      paddingTop +
      ((maxPrice - price) /
        (maxPrice - minPrice)) *
        chartHeight
    );
  };

  const actualPath = data
    .map((item, index) => {
      const x = getX(index);
      const y = getY(item.actual);

      return `${
        index === 0 ? "M" : "L"
      } ${x} ${y}`;
    })
    .join(" ");

  const predictedPath = data
    .map((item, index) => {
      const x = getX(index);
      const y = getY(item.predicted);

      return `${
        index === 0 ? "M" : "L"
      } ${x} ${y}`;
    })
    .join(" ");

  const gridLines = 5;

  const yLabels = Array.from(
    { length: gridLines + 1 },
    (_, index) => {
      const value =
        maxPrice -
        (index / gridLines) *
          (maxPrice - minPrice);

      return {
        value,
        y: getY(value)
      };
    }
  );

  const dateIndexes = [];

  if (data.length <= 6) {
    data.forEach((_, index) => {
      dateIndexes.push(index);
    });
  } else {
    const step = Math.max(
      1,
      Math.floor(
        (data.length - 1) / 5
      )
    );

    for (
      let i = 0;
      i < data.length;
      i += step
    ) {
      dateIndexes.push(i);
    }

    if (
      !dateIndexes.includes(
        data.length - 1
      )
    ) {
      dateIndexes.push(
        data.length - 1
      );
    }
  }

  return {
    width,
    height,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    chartWidth,
    chartHeight,
    data,
    actualPath,
    predictedPath,
    yLabels,
    dateIndexes,
    getX,
    getY
  };
}, [modelEvaluation]);


  // =========================================================
  // CHART
  // =========================================================

  const chart = useMemo(() => {
    if (!history.length) {
      return null;
    }

    const points = history
      .map((item) => {
        let parsedDate = null;

        if (
          item.date !== null &&
          item.date !== undefined
        ) {
          if (typeof item.date === "number") {
            const timestamp =
              item.date < 100000000000
                ? item.date * 1000
                : item.date;

            parsedDate = new Date(timestamp);
          } else {
            parsedDate = new Date(item.date);
          }
        }

        return {
          date: item.date,
          parsedDate,
          close: Number(item.close)
        };
      })
      .filter(
        (item) =>
          Number.isFinite(item.close) &&
          item.parsedDate instanceof Date &&
          !Number.isNaN(
            item.parsedDate.getTime()
          )
      );

    if (!points.length) {
      return null;
    }

    const width = 900;
    const height = 350;

    const paddingLeft = 65;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 50;

    const chartWidth =
      width -
      paddingLeft -
      paddingRight;

    const chartHeight =
      height -
      paddingTop -
      paddingBottom;

    const prices = points.map(
      (p) => p.close
    );

    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    if (predictedPrice !== null) {
      minPrice = Math.min(
        minPrice,
        predictedPrice
      );

      maxPrice = Math.max(
        maxPrice,
        predictedPrice
      );
    }

    const range =
      maxPrice - minPrice || 1;

    minPrice -= range * 0.08;
    maxPrice += range * 0.08;

    const getX = (index) => {
      if (points.length === 1) {
        return (
          paddingLeft +
          chartWidth / 2
        );
      }

      return (
        paddingLeft +
        (index /
          (points.length - 1)) *
          chartWidth
      );
    };

    const getY = (price) => {
      return (
        paddingTop +
        ((maxPrice - price) /
          (maxPrice - minPrice)) *
          chartHeight
      );
    };

    const path = points
      .map((point, index) => {
        const x = getX(index);
        const y = getY(point.close);

        return `${
          index === 0 ? "M" : "L"
        } ${x} ${y}`;
      })
      .join(" ");

    const areaPath = `
      ${path}
      L ${getX(points.length - 1)}
        ${paddingTop + chartHeight}
      L ${getX(0)}
        ${paddingTop + chartHeight}
      Z
    `;

    const gridLines = 5;

    const yLabels = Array.from(
      { length: gridLines + 1 },
      (_, index) => {
        const value =
          maxPrice -
          (index / gridLines) *
            (maxPrice - minPrice);

        return {
          value,
          y: getY(value)
        };
      }
    );

    const dateIndexes = [];

    if (points.length <= 6) {
      points.forEach((_, index) => {
        dateIndexes.push(index);
      });
    } else {
      const step = Math.max(
        1,
        Math.floor(
          (points.length - 1) / 5
        )
      );

      for (
        let i = 0;
        i < points.length;
        i += step
      ) {
        dateIndexes.push(i);
      }

      if (
        !dateIndexes.includes(
          points.length - 1
        )
      ) {
        dateIndexes.push(
          points.length - 1
        );
      }
    }

    const predictedY =
      predictedPrice !== null
        ? getY(predictedPrice)
        : null;

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
      points,
      path,
      areaPath,
      yLabels,
      dateIndexes,
      getX,
      getY,
      predictedY,
      minPrice,
      maxPrice
    };
  }, [history, predictedPrice]);

  // =========================================================
  // STOCK CLICK
  // =========================================================

  const handleStockClick = async (
    stockSymbol
  ) => {
    const upperSymbol =
      stockSymbol.toUpperCase();

    setSearch(upperSymbol);
    setSymbol(upperSymbol);
    setError("");

    await Promise.all([
      fetchPrediction(upperSymbol),
      fetchSignal(upperSymbol),
      fetchHistory(upperSymbol),
      fetchModelEvaluation(
        upperSymbol
      )
    ]);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">
          <Activity size={25} />

          <span>
            StockPredict AI
          </span>
        </div>

        <div className="nav-status">

          <span className="status-dot"></span>

          System Online

        </div>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="container">

        {/* ================= HERO ================= */}

        <section className="hero">

          <div>

            <p className="eyebrow">
              AI POWERED STOCK ANALYTICS
            </p>

            <h1>
              Predict the market.
              <br />

              <span>
                Make informed decisions.
              </span>
            </h1>

            <p className="hero-text">
              Analyze stock data and generate
              AI-powered next-day price
              predictions using machine learning.
            </p>

          </div>


          {/* SEARCH */}

          <form
            className="search-box"
            onSubmit={handleSearch}
          >

            <Search size={20} />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Enter stock symbol..."
            />

            <button type="submit">
              Analyze
            </button>

          </form>

        </section>


        {/* ================= ERROR ================= */}

        {error && (
  <div className="error error-enhanced">
    <div className="error-content">
      <strong>Something went wrong</strong>
      <span>{error}</span>
    </div>

    <button
      className="error-retry-btn"
      onClick={() => {
        setError("");

        Promise.all([
          fetchPrediction(symbol),
          fetchSignal(symbol),
          fetchHistory(symbol),
          fetchModelEvaluation(symbol)
        ]);
      }}
      disabled={
        loading ||
        signalLoading ||
        historyLoading ||
        evaluationLoading
      }
    >
      <RefreshCw
        size={16}
        className={
          loading ? "spin" : ""
        }
      />
      Retry
    </button>
  </div>
)}


        {/* ================= PREDICTION ================= */}

        {loading ? (

          <div className="loading">

            <RefreshCw
              className="spin"
              size={25}
            />

            Loading prediction...

          </div>

        ) : prediction ? (

          <section className="dashboard-grid prediction-layout">

            {/* STOCK CARD */}

            <div className="card stock-card prediction-primary">

              <div className="card-header">

                <div>

                  <p className="muted">
                    STOCK
                  </p>

                  <h2>
                    {prediction.symbol}
                  </h2>

                </div>

                <div className="stock-icon">

                  {expectedChange !== null &&
                  expectedChange < 0 ? (
                    <TrendingDown size={25} />
                  ) : (
                    <TrendingUp size={25} />
                  )}

                </div>

              </div>


              <div className="price-section">

                <p className="muted">
                  Predicted Next-Day Price
                </p>

                <div className="price">

                  $
                  {predictedPrice !== null
                    ? predictedPrice.toFixed(2)
                    : "--"}

                </div>

              </div>


              <div className="prediction-badge">

                <TrendingUp size={18} />

                AI Prediction

              </div>

            </div>


            {/* PREDICTION DETAILS */}

            <div className="card details-card prediction-details">

              <div className="card-header">

                <div>

                  <p className="muted">
                    ANALYSIS
                  </p>

                  <h2>
                    Prediction Summary
                  </h2>

                </div>

              </div>


              <div className="metric">

                <span>
                  Symbol
                </span>

                <strong>
                  {prediction.symbol}
                </strong>

              </div>


              <div className="metric">

                <span>
                  Current Price
                </span>

                <strong>
                  {currentPrice !== null
                    ? `$${currentPrice.toFixed(2)}`
                    : "--"}
                </strong>

              </div>


              <div className="metric">

                <span>
                  Predicted Price
                </span>

                <strong>
                  {predictedPrice !== null
                    ? `$${predictedPrice.toFixed(2)}`
                    : "--"}
                </strong>

              </div>


              <div className="metric">

                <span>
                  Predicted Return
                </span>

                <strong
                  className={
                    Number(
                      prediction.predictedReturn
                    ) >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {prediction.predictedReturn !==
                  undefined
                    ? `${
                        Number(
                          prediction.predictedReturn
                        ) >= 0
                          ? "+"
                          : ""
                      }${Number(
                        prediction.predictedReturn
                      ).toFixed(2)}%`
                    : "--"}
                </strong>

              </div>

            </div>

          </section>

        ) : null}


        {/* ================= AI SIGNAL ================= */}

        {prediction && (

          <section className="signal-dashboard card outlook-card">

            <div className="outlook-header">

              <div>

                <p className="eyebrow">
                  AI TRADING SIGNAL
                </p>

                <h2>
                  {symbol} Market Outlook
                </h2>

              </div>


              {signalLoading ? (

                <div className="signal-box neutral">

                  <RefreshCw
                    size={22}
                    className="spin"
                  />

                  <span>
                    Analyzing
                  </span>

                </div>

              ) : signal ? (

                <div
                  className={`signal-box ${signalType}`}
                >

                  {signal.signal === "BUY" && (
                    <TrendingUp size={30} />
                  )}

                  {signal.signal === "SELL" && (
                    <TrendingDown size={30} />
                  )}

                  {signal.signal === "HOLD" && (
                    <Activity size={30} />
                  )}

                  <span>
                    {signal.signal}
                  </span>

                </div>

              ) : (

                <div className="signal-box neutral">

                  <Activity size={25} />

                  <span>
                    Unavailable
                  </span>

                </div>

              )}

            </div>


            {signal && (

              <>

                <div className="signal-metrics">

                  <div>

                    <span>
                      Current Price
                    </span>

                    <strong>
                      $
                      {Number(
                        signal.currentPrice
                      ).toFixed(2)}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Predicted Price
                    </span>

                    <strong>
                      $
                      {Number(
                        signal.predictedPrice
                      ).toFixed(2)}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Expected Change
                    </span>

                    <strong
                      className={
                        Number(
                          signal.changePercent
                        ) >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {Number(
                        signal.changePercent
                      ) >= 0
                        ? "+"
                        : ""}

                      {Number(
                        signal.changePercent
                      ).toFixed(2)}
                      %
                    </strong>

                  </div>


                  <div>

                    <span>
                      Confidence
                    </span>

                    <strong>
                      {Number(
                        signal.confidence
                      ).toFixed(1)}
                      %
                    </strong>

                  </div>

                </div>


                {/* CONFIDENCE BAR */}

                <div className="confidence-container">

                  <div className="confidence-header">

                    <span>
                      Model Confidence
                    </span>

                    <strong>
                      {Number(
                        signal.confidence
                      ).toFixed(1)}
                      %
                    </strong>

                  </div>


                  <div className="confidence-bar">

                    <div
                      className="confidence-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              signal.confidence
                            )
                          )
                        )}%`
                      }}
                    />

                  </div>

                </div>


                {/* SIGNAL DESCRIPTION */}

                <div className="signal-description">

                  <Activity size={18} />

                  <span>

                    {signal.signal === "BUY" &&
                      "The model predicts an upward price movement for the next trading session."}

                    {signal.signal === "SELL" &&
                      "The model predicts a downward price movement for the next trading session."}

                    {signal.signal === "HOLD" &&
                      "The model predicts relatively limited price movement. Monitoring the stock may be appropriate."}

                  </span>

                </div>

              </>

            )}

          </section>

        )}


        {/* ================= MARKET HISTORY ================= */}

      <section className="history-section card">
  <div className="section-title">
    <div>
      <p className="eyebrow">MARKET HISTORY</p>
      <h2>{symbol} Price History</h2>
    </div>

    <div className="history-header-actions">
      <div className="history-badge">Historical Close</div>

      <button
        className="refresh-btn"
        onClick={refreshCurrentStock}
        disabled={refreshing}
      >
        <RefreshCw
          size={17}
          className={refreshing ? "spin" : ""}
        />
        {refreshing ? "Refreshing..." : "Refresh Analysis"}
      </button>
    </div>
  </div>


          {historyLoading ? (

            <div className="loading chart-loading">

              <RefreshCw
                className="spin"
                size={20}
              />

              Loading historical data...

            </div>

          ) : chart ? (

            <div className="chart-wrapper">

              <svg
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                className="price-chart"
                preserveAspectRatio="none"
              >

                {/* GRID */}

                {chart.yLabels.map(
                  (label, index) => (

                    <g key={index}>

                      <line
                        x1={chart.paddingLeft}
                        y1={label.y}
                        x2={
                          chart.width -
                          chart.paddingRight
                        }
                        y2={label.y}
                        className="chart-grid"
                      />

                      <text
                        x={
                          chart.paddingLeft - 10
                        }
                        y={label.y + 4}
                        textAnchor="end"
                        className="chart-label"
                      >
                        $
                        {label.value.toFixed(0)}
                      </text>

                    </g>

                  )
                )}


                {/* AREA */}

                <path
                  d={chart.areaPath}
                  className="chart-area"
                />


                {/* LINE */}

                <path
                  d={chart.path}
                  className="chart-line"
                  fill="none"
                />


                {/* LAST DATA POINT */}

                {chart.points.map(
                  (point, index) => {

                    if (
                      index !==
                      chart.points.length - 1
                    ) {
                      return null;
                    }

                    return (

                      <circle
                        key={index}
                        cx={chart.getX(index)}
                        cy={chart.getY(
                          point.close
                        )}
                        r="5"
                        className="chart-point"
                      />

                    );
                  }
                )}


                {/* PREDICTION LINE */}

                {chart.predictedY !== null && (

                  <g>

                    <line
                      x1={chart.paddingLeft}
                      y1={chart.predictedY}
                      x2={
                        chart.width -
                        chart.paddingRight
                      }
                      y2={chart.predictedY}
                      className="prediction-line"
                    />

                    <text
                      x={
                        chart.width -
                        chart.paddingRight -
                        5
                      }
                      y={
                        chart.predictedY - 8
                      }
                      textAnchor="end"
                      className="prediction-label"
                    >
                      Prediction $
                      {predictedPrice.toFixed(2)}
                    </text>

                  </g>

                )}


                {/* DATES */}

                {chart.dateIndexes.map(
                  (index) => {

                    const point =
                      chart.points[index];

                    const date =
                      point.parsedDate;

                    const label =
                      date.toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric"
                        }
                      );

                    return (

                      <text
                        key={index}
                        x={chart.getX(index)}
                        y={
                          chart.height - 15
                        }
                        textAnchor="middle"
                        className="chart-label"
                      >
                        {label}
                      </text>

                    );

                  }
                )}

              </svg>

            </div>

          ) : (

            <div className="empty">
              No historical data available.
            </div>

          )}

        </section>


        {/* ================= MODEL PERFORMANCE ================= */}

        {modelEvaluation && (

          <section className="performance-section">

            <div className="section-title">

              <div>

                <p className="eyebrow">
                  MODEL PERFORMANCE
                </p>

                <h2>
                  {modelEvaluation.symbol}
                  {" "}
                  Model Evaluation
                </h2>

              </div>

              <div className="history-badge">

                {modelEvaluation.model ||
                  "Random Forest"}

              </div>

            </div>


            <div className="performance-grid">

              {/* MAE */}

              <div className="card performance-metric">

                <span>
                  MAE
                </span>

                <strong>
                  {modelEvaluation.mae !==
                  undefined
                    ? Number(
                        modelEvaluation.mae
                      ).toFixed(2)
                    : "--"}
                </strong>

                <small>
                  Mean Absolute Error
                </small>

              </div>


              {/* RMSE */}

              <div className="card performance-metric">

                <span>
                  RMSE
                </span>

                <strong>
                  {modelEvaluation.rmse !==
                  undefined
                    ? Number(
                        modelEvaluation.rmse
                      ).toFixed(2)
                    : "--"}
                </strong>

                <small>
                  Root Mean Squared Error
                </small>

              </div>


              {/* MODEL */}

              <div className="card performance-metric">

                <span>
                  MODEL
                </span>

                <strong>
                  Random Forest
                </strong>

                <small>
                  Regression algorithm
                </small>

              </div>

              {/* DIRECTIONAL ACCURACY */}

<div className="card performance-metric">
  <span>
    DIRECTIONAL ACCURACY
  </span>

  <strong>
    {modelInsights.directionalAccuracy !== null
      ? `${modelInsights.directionalAccuracy.toFixed(2)}%`
      : "--"}
  </strong>

  <small>
    Correct up/down predictions
  </small>
</div>


{/* AVERAGE ERROR */}

<div className="card performance-metric">
  <span>
    AVG. PREDICTION ERROR
  </span>

  <strong>
    {modelInsights.averageError !== null
      ? `${modelInsights.averageError.toFixed(2)}%`
      : "--"}
  </strong>

  <small>
    Average percentage error
  </small>
</div>


{/* TEST RECORDS */}

<div className="card performance-metric">
  <span>
    TEST DATA
  </span>

  <strong>
    {modelEvaluation.testingRecords || "--"}
  </strong>

  <small>
    Unseen historical records
  </small>
</div>


              {/* TRAINING RECORDS */}

              <div className="card performance-metric">

                <span>
                  TRAINING DATA
                </span>

                <strong>
                  {modelEvaluation.trainingRecords ||
                    "--"}
                </strong>

                <small>
                  Historical records
                </small>

              </div>

            </div>


            <div className="model-note">

              <Activity size={18} />

              <span>
                Lower MAE and RMSE indicate
                better historical prediction
                accuracy.
              </span>

            </div>

            <div className="accuracy-insights">

  <div className="accuracy-insight-header">
    <div>
      <p className="eyebrow">
        MODEL INSIGHTS
      </p>

      <h3>
        Prediction Quality
      </h3>
    </div>

    <Activity size={20} />
  </div>

  <div className="accuracy-summary">

    <div>
      <span>Directional Accuracy</span>

      <strong>
        {modelInsights.directionalAccuracy !== null
          ? `${modelInsights.directionalAccuracy.toFixed(1)}%`
          : "--"}
      </strong>
    </div>

    <div>
      <span>Average Error</span>

      <strong>
        {modelInsights.averageError !== null
          ? `${modelInsights.averageError.toFixed(2)}%`
          : "--"}
      </strong>
    </div>

    <div>
      <span>Evaluation Records</span>

      <strong>
        {modelInsights.totalRecords || "--"}
      </strong>
    </div>

  </div>

  <p className="accuracy-description">
    Directional accuracy measures how often the model
    correctly predicts whether the next price movement
    will be upward or downward.
  </p>

</div>


            {/* ================= FEATURE IMPORTANCE ================= */}

{featureImportance.length > 0 && (

  <div className="analytics-chart-card">

    <div className="analytics-chart-header">

      <div>
        <p className="eyebrow">
          MACHINE LEARNING ANALYSIS
        </p>

        <h3>
          Feature Importance
        </h3>

        <p className="analytics-description">
          Relative contribution of each input
          feature used by the Random Forest model.
        </p>
      </div>

    </div>

    <div className="feature-importance-list">

      {featureImportance.map(
        (item, index) => {

          const percentage =
            item.importance * 100;

          const width =
            Math.max(
              3,
              percentage
            );

          return (

            <div
              className="feature-row"
              key={item.feature}
            >

              <div className="feature-label">

                <span className="feature-rank">
                  #{index + 1}
                </span>

                <span>
                  {item.feature}
                </span>

              </div>

              <div className="feature-bar-wrapper">

                <div className="feature-bar">

                  <div
                    className="feature-fill"
                    style={{
                      width: `${width}%`
                    }}
                  />

                </div>

                <span className="feature-value">
                  {percentage.toFixed(2)}%
                </span>

              </div>

            </div>

          );

        }
      )}

    </div>

  </div>

)}


{/* ================= ACTUAL VS PREDICTED ================= */}

{evaluationChart && (

  <div className="analytics-chart-card">

    <div className="analytics-chart-header">

      <div>

        <p className="eyebrow">
          MODEL VALIDATION
        </p>

        <h3>
          Actual vs Predicted
        </h3>

        <p className="analytics-description">
          Comparison of actual stock prices
          against Random Forest predictions
          during the testing period.
        </p>

      </div>

      <div className="chart-legend">

        <span>
          <i className="legend-dot actual-dot"></i>
          Actual
        </span>

        <span>
          <i className="legend-dot predicted-dot"></i>
          Predicted
        </span>

      </div>

    </div>


    <div className="evaluation-chart-wrapper">

      <svg
        viewBox={`0 0 ${evaluationChart.width} ${evaluationChart.height}`}
        className="evaluation-chart"
        preserveAspectRatio="none"
      >

        {/* GRID */}

        {evaluationChart.yLabels.map(
          (label, index) => (

            <g key={index}>

              <line
                x1={evaluationChart.paddingLeft}
                y1={label.y}
                x2={
                  evaluationChart.width -
                  evaluationChart.paddingRight
                }
                y2={label.y}
                className="evaluation-grid"
              />

              <text
                x={
                  evaluationChart.paddingLeft - 10
                }
                y={label.y + 4}
                textAnchor="end"
                className="evaluation-label"
              >
                ${label.value.toFixed(0)}
              </text>

            </g>

          )
        )}


        {/* ACTUAL */}

        <path
          d={evaluationChart.actualPath}
          className="actual-line"
          fill="none"
        />


        {/* PREDICTED */}

        <path
          d={evaluationChart.predictedPath}
          className="predicted-line"
          fill="none"
        />


        {/* DATES */}

        {evaluationChart.dateIndexes.map(
          (index) => {

            const item =
              evaluationChart.data[index];

            const date =
              new Date(item.date);

            const label =
              !Number.isNaN(
                date.getTime()
              )
                ? date.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric"
                    }
                  )
                : item.date;

            return (

              <text
                key={index}
                x={evaluationChart.getX(index)}
                y={
                  evaluationChart.height - 15
                }
                textAnchor="middle"
                className="evaluation-label"
              >
                {label}
              </text>

            );

          }
        )}

      </svg>

    </div>

  </div>

)}

          </section>

        )}


        {/* ================= WATCHLIST ================= */}

        <section className="stocks-section">

          <div className="section-title">

            <div>

              <p className="eyebrow">
                WATCHLIST
              </p>

              <h2>
                Popular Stocks
              </h2>

              <p className="watchlist-subtitle">
                Select a stock to analyze its
                AI prediction
              </p>

            </div>


            <button
              className="refresh-btn"
              onClick={fetchStocks}
            >

              <RefreshCw size={17} />

              Refresh

            </button>

          </div>


          {stocks.length === 0 ? (

            <div className="empty">
              No stocks available.
            </div>

          ) : (

            <div className="stock-grid">

              {stocks.map((stock) => (

                <button
                  className={`stock-card-item ${
                    symbol === stock.symbol
                      ? "active-stock"
                      : ""
                  }`}
                  key={stock.id}
                  onClick={() =>
                    handleStockClick(
                      stock.symbol
                    )
                  }
                >

                  <div className="stock-card-top">

                    <div className="stock-symbol-large">

                      {stock.symbol}

                    </div>

                    <div className="stock-trend-icon">

                      <TrendingUp size={19} />

                    </div>

                  </div>


                  <div className="company-name-large">

                    {stock.companyName}

                  </div>


                  <div className="stock-card-footer">

                    <span>
                      AI Prediction
                    </span>

                    <span className="analyze-stock">
                      Analyze →
                    </span>

                  </div>

                </button>

              ))}

            </div>

          )}

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer>

        <p>
          StockPredict AI · Machine Learning
          Powered Stock Prediction
        </p>

      </footer>

    </div>
  );
}

export default App;