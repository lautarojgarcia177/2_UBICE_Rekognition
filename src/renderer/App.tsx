import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Initial, Results } from './components';
import Modal from 'react-modal';
import { Button, Icon, TextInput } from 'react-materialize';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default function App() {
  let subtitle: any;
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
    document.getElementsByClassName('button__select_directory')[0].classList.add('hide');
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
    document.getElementsByClassName('button__select_directory')[0].classList.remove('hide');
    console.log('Cerrado el modal');
  }

  window.addEventListener('set-aws-credentials', () => {
    console.log('open dialog set AWS credentials');
    openModal();
  });

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Configurar credenciales AWS"
      >
        <h5>Credenciales AWS</h5>
        <form>
          <div className="input-field">
            <input
              placeholder="Access Key"
              id="access_key"
              type="text"
              className="validate"
            />
            <input
              placeholder="Secret Access Key"
              id="secret_access_key"
              type="password"
              className="validate"
            />
          </div>
        </form>
        <div className="aws-credentials-dialog__buttons">
          <Button floating={false} small={true} node="button" waves="purple">
            Guardar
            <Icon left>save</Icon>
          </Button>
          <Button
            className="ms-1"
            small={true}
            node="button"
            waves="red"
            onClick={closeModal}
          >
            Cancelar
            <Icon left>cancel</Icon>
          </Button>
        </div>
      </Modal>
      <Router>
        <Routes>
          <Route path="/" element={<Initial />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </>
  );
}
