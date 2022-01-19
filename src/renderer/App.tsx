import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  Initial,
  Results,
  AWSCredentialsDialog,
  ErrorHandler,
} from './components';

export default function App() {
  return (
    <>
      <ErrorHandler />
      <AWSCredentialsDialog />
      <Router>
        <Routes>
          <Route path="/" element={<Initial />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </>
  );
}
