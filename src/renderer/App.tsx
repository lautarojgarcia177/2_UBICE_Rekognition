import {
  MemoryRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import '../../assets/styles/google-icon-font.css';
import './App.css';
import { Initial, Results } from './components';

export default function App() {

  window.addEventListener('set-aws-credentials', () => {
    console.log('open dialog set AWS credentials');
  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Initial />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}
