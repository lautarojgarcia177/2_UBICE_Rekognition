import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import '../../assets/styles/google-icon-font.css';
import './App.css';
import { Modal, Button } from 'react-materialize';

const trigger = <Button>Open Modal</Button>;

const Initial = () => {
  return (
    <div>
      <Modal header="Modal Header" trigger={trigger}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </Modal>
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
