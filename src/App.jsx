import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'

function App() {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formattedTime = currentTime.toLocaleTimeString();
  const API_KEY = import.meta.env.VITE_API_KEY;
  // Fetch available currencies on mount
  useEffect(()=>{
    const fetchCurrencies = async () => {
      try{
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`
        );
        console.log(response.data);
        setCurrencies(response.data.supported_codes || []);
      }catch (err){
        console.error(err);
        setError('Failed to load currencies');
      }
    };
    fetchCurrencies();
  }, [API_KEY]);

  // Convert currency
  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`
      );
      setResult(response.data.conversion_result);
    } catch (err) {
      console.error(err);
      setError('Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Swap currencies
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };
  //updates the displayed time every second
  useEffect(() => {
    const timer = setInterval(() =>{
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  });
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="converter">
      <h1>Currency Converter</h1>
      <div className="date-time">
        <p>{formattedDate}</p>
        <p>{formattedTime}</p>
        <small>{timeZone}</small>
      </div>
      <div className="input-group">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
        />
      </div>
      <div className="currency-selectors">
        <div className="input-group">
          <label>From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            {Array.isArray(currencies) &&
              currencies.map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
            ))}
          </select>
        </div>
        <button className="swap-btn" onClick={handleSwap}>⇄</button>
        <div className="input-group">
          <label>To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {currencies.map(([code, name]) => (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button className="convert-btn" onClick={handleConvert} disabled={loading}>
        {loading ? 'Converting...' : 'Convert'}
      </button>
      {error && <p className="error">{error}</p>}
      {result !== null && (
        <div className="result">
          <p>
            {amount} {fromCurrency} = <strong>{result.toFixed(2)} {toCurrency}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default App
