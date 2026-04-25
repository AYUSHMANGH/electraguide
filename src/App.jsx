import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Assistant from './pages/Assistant';
import Timeline from './pages/Timeline';
import Quiz from './pages/Quiz';
import Eligibility from './pages/Eligibility';
import Map from './pages/Map';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="eligibility" element={<Eligibility />} />
          <Route path="map" element={<Map />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
