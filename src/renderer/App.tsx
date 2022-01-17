import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import { Initial, Results, AWSCredentialsDialog } from './components';

export default function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
      />
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
