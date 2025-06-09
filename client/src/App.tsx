
import { Route, Router } from "wouter";
import { BrandGuideProvider } from '@/context/BrandGuideContext';

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Preview from "@/pages/Preview";
import Help from "@/pages/Help";
import Privacy from "@/pages/Privacy";

function App() {
  return (
    <BrandGuideProvider>
      <Router>
        <Route path="/" component={Index} />
        <Route path="/preview" component={Preview} />
        <Route path="/preview/:guideId" component={Preview} />
        <Route path="/help" component={Help} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Router>
    </BrandGuideProvider>
  );
}

export default App;
