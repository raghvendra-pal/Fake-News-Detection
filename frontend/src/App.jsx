import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import NewsChecker from './pages/NewsChecker';
import ReviewChecker from './pages/ReviewChecker';
import LatestNews from './pages/LatestNews';
import Dashboard from './pages/Dashboard';
import ModelEvaluation from './pages/ModelEvaluation';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [prefilledNewsUrl, setPrefilledNewsUrl] = useState('');
  const [prefilledNewsText, setPrefilledNewsText] = useState('');
  const [prefilledReviewText, setPrefilledReviewText] = useState('');

  // Handle sample selection from Home page
  const handleSelectSample = (sampleType) => {
    if (sampleType === 'real_news') {
      setPrefilledNewsUrl('');
      setPrefilledNewsText("The Indian Space Research Organisation (ISRO) on Monday launched a next-generation navigation satellite into geostationary transfer orbit from Sriharikota. Officials confirmed that the satellite will augment the NavIC regional navigation constellation and is equipped with a domestically engineered rubidium atomic clock. Tracking stations in Bengaluru reported nominal telemetry following payload separation.");
      setActiveTab('news');
    } else if (sampleType === 'fake_news') {
      setPrefilledNewsUrl('');
      setPrefilledNewsText("Big Pharma is completely terrified of this one simple discovery! An ancient Himalayan herb known as Sanjeevani-9 has been proven to cure cancer, diabetes, arthritis, and heart disease in less than 48 hours without any surgery or medicine. Greed-driven hospital corporations have paid millions to keep this miracle leaf hidden from the public. Click here to claim your supply before it is permanently banned!");
      setActiveTab('news');
    } else if (sampleType === 'fake_review') {
      setPrefilledReviewText("THIS IS THE GREATEST PRODUCT IN THE ENTIRE WORLD! Absolutely unbelievable miracle quality! Everyone in the world must buy this immediately right now! Best purchase of my life 1000% recommended! Perfect in every single way! Don't hesitate just buy buy buy!");
      setActiveTab('review');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle "Verify in TruthLens" click from Latest News feed
  const handleVerifyArticle = (target) => {
    if (target.startsWith('http://') || target.startsWith('https://')) {
      setPrefilledNewsUrl(target);
      setPrefilledNewsText('');
    } else {
      setPrefilledNewsUrl('');
      setPrefilledNewsText(target);
    }
    setActiveTab('news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <Home setActiveTab={setActiveTab} onSelectSample={handleSelectSample} />
        )}

        {activeTab === 'news' && (
          <NewsChecker
            key={prefilledNewsUrl || prefilledNewsText}
            initialUrl={prefilledNewsUrl}
            initialText={prefilledNewsText}
          />
        )}

        {activeTab === 'review' && (
          <ReviewChecker
            key={prefilledReviewText}
            initialText={prefilledReviewText}
          />
        )}

        {activeTab === 'latest' && (
          <LatestNews onVerifyArticle={handleVerifyArticle} />
        )}

        {activeTab === 'history' && (
          <Dashboard />
        )}

        {activeTab === 'model' && (
          <ModelEvaluation />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
