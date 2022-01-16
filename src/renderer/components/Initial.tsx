import { useState } from 'react';
import { Button, Icon, Modal, Preloader } from 'react-materialize';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/icons/ubice-logo.png';

export const Initial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  function selectDirectory() {
    window.electron.ipcRenderer.selectDirectory();
  }
  window.addEventListener('rekognition-finished', () => {
    navigate('/results');
  });
  const selectDirectoryButton = (
    <>
      <p>
        Abra un directorio con imagenes de corredores para reconocer los
        números.
        <br />
        <i>Las imágenes deben ser en formato jpg, jpeg o png.</i>
        <br />
        <small>
          Asegurese de configurar sus credenciales de AWS en el menú
          configuración - Credenciales de AWS
        </small>
      </p>
      <Button
        node="button"
        style={{
          marginRight: '5px',
        }}
        waves="light"
        onClick={selectDirectory}
      >
        SELECCIONAR DIRECTORIO
        <Icon left>folder_open</Icon>
      </Button>
    </>
  );
  return (
    <div>
      <div id="Initial" className="center-align">
        <img width="200px" alt="icon" src={logo} />
        <h2>UBICE - Rekognition</h2>
        <div>
          {loading ? (
            <Preloader active color="blue" flashing size="big" />
          ) : (
            selectDirectoryButton
          )}
        </div>
      </div>
    </div>
  );
};
