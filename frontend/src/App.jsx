import { Routes, Route } from 'react-router-dom';
import Home from './component/Home';
import Login from './component/login';
import DiabetesPrediction from './component/diabetesPrediction';
import HeartAttackPrediction from './component/heartAttackPrediction';
import History from './component/history';
import AboutUs from './component/aboutUs';
import Navbar from './extra/Navbar';
import Signup from './component/signUp';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diabetes" element={<DiabetesPrediction />} />
        <Route path="/heart-attack" element={<HeartAttackPrediction />} />
        <Route path="/history" element={<History />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/signUp" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;