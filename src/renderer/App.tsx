import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import logo from '../../assets/icons/ubice-logo.png';
import '../../assets/styles/google-icon-font.css';
import './App.css';
import { Preloader } from 'react-materialize';

const Initial = () => {
  return (
    <div>
      <div className="Initial center-align">
        <img width="200px" alt="icon" src={logo} />
      <h2>UBICE - Rekognition</h2>
      {/* <div className='Initial'>
        {loading ? loadingSpinner : selectDirectoryButton}
      </div> */}
      <Preloader active color="blue" flashing size="big" />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Initial />} />
      </Routes>
    </Router>
  );
}
