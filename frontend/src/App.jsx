import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import ArticleView from './pages/ArticleView';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/article/:id" element={<ArticleView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;