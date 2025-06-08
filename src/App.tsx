
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BrandGuideProvider } from '@/context/BrandGuideContext';
import { ErrorBoundary } from "react-error-boundary";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Preview from "@/pages/Preview";

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
        <p className="text-gray-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error Boundary caught an error:', error, errorInfo);
      }}
    >
      <BrandGuideProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/preview/:guideId" element={<Preview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </BrandGuideProvider>
    </ErrorBoundary>
  );
}

export default App;
