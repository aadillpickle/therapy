import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Success from './pages/Success';
import LegalPage from './pages/Legal'
import posthog from 'posthog-js'

posthog.init('phc_l7GgIb4y7bvAIlCDWLn4Ie2mHwoGlUVZXOSSKeiDc2p', { api_host: 'https://app.posthog.com' })
const App = () => {
  
	return (
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/success" element={<Success />} />
          <Route path="/legal" element={<LegalPage />} />
        </Routes>
      </Router>

	);
};

export default App;
