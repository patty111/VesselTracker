import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import World from './App';
import traceData from './vessel_trace_data.json';

const App = () => {
  const [traceResponseData, setTraceResponseData] = useState(null);

  useEffect(() => {
    setTraceResponseData(traceData);
  }, []);

  return traceResponseData ? <World traceResponseData={traceResponseData} /> : <div>Loading...</div>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
