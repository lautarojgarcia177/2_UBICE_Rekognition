import { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Icon, Preloader, ProgressBar } from 'react-materialize';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/icons/ubice-logo.png';
import { ToastContainer, toast } from 'react-toastify';
import { debounce } from 'lodash';

export const Initial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.removeEventListener('rekognition-progress', (event) => {
      const _progress = Number((event.detail.progress * 100).toFixed());
      setProgress(_progress);
    });
  }, [progress]);
  useEffect(() => {
    /* listeners of renderer process (preload.js) */
    let rekognitionProgressListener = (event) =>
      setProgress(Number((event.detail.progress * 100).toFixed()));

    let rekognitionFailureListener = (event) => setLoading(false);
    window.addEventListener(
      'rekognition-progress',
      rekognitionProgressListener
    );
    window.addEventListener('rekognition-failure', rekognitionFailureListener);
    return () => {
      window.removeEventListener(
        'rekognition-progress',
        rekognitionProgressListener
      );
      window.removeEventListener(
        'rekognition-failure',
        rekognitionFailureListener
      );
    };
  });
  function selectDirectory() {
    window.electron.ipcRenderer.selectDirectory();
  }
  window.addEventListener('rekognition-finished', () => {
    navigate('/results');
  });
  window.addEventListener('aws-rekognition__start', () => {
    setLoading(true);
  });
  window.addEventListener('directory-selected__no-images-error', () => {
    setLoading(false);
  });
  window.addEventListener('directory-selection-cancelled', () => {
    setLoading(false);
  });

  const selectDirectoryButton = (
    <>
      <p>
        Abra un directorio con imagenes de corredores para reconocer los
        números.
        <br />
        <i>Las imágenes deben estar en formato jpg, jpeg o png.</i>
        <br />
        <small>
          Asegurese de configurar sus credenciales de AWS en el menú
          configuración - Credenciales de AWS. La aplicación trabaja en la
          región us-west-1 de AWS. Para cambiar la región, contáctese con el
          desarrollador.
        </small>
      </p>
      <Button
        className="button__select_directory"
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

  const btn__last_results = (
    <Button
      className="left-align mt-1 ms-1"
      node="button"
      waves="light"
      onClick={() => navigate('/results')}
    >
      Ver últimos resultados obtenidos
      <Icon right>arrow_right</Icon>
    </Button>
  );

  const btn__aws_credentials = (
    <Button
      className="left-align mt-1 ms-1"
      node="button"
      waves="light"
      onClick={() => window.dispatchEvent(new Event('set-aws-credentials'))}
    >
      Configurar credenciales de AWS
      <Icon right>cloud_queue</Icon>
    </Button>
  );

  return (
    <div>
      <div id="Initial" className="center-align">
        <img width="200px" alt="icon" src={logo} />
        <h2>UBICE - Rekognition</h2>
        <div>
          {loading ? (
            <>
              <Preloader active color="blue" flashing size="big" />
              <h5>AWS esta reconociendo las imágenes...</h5>
              <ProgressBar progress={progress} />
              <small>{progress}%</small>
            </>
          ) : (
            selectDirectoryButton
          )}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 10,
          bottom: 20,
        }}
      >
        <div>
          {!!window.localStorage.getItem('rekognitionResults') &&
            btn__last_results}
        </div>
        <div>{btn__aws_credentials}</div>
      </div>
    </div>
  );
};
