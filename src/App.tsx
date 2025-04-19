
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Preview from "@/pages/Preview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/preview/:guideId" element={<Preview />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
