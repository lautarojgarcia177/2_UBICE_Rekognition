import { debounce } from 'lodash';
import { useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';

export function ErrorHandler() {
  window.addEventListener('directory-selected__no-images-error', () => {
    debouncedNotifyNoImagesInDirectoryError();
  });
  window.addEventListener('rekognition-failure', (event) => {
    const error = event.detail.error;
    debouncedNotifyRekognitionError(error);
  });
  const debouncedNotifyNoImagesInDirectoryError = useRef(
    debounce(
      () =>
        toast.error(
          'No se encontro ninguna imagen jpg, jpeg o png en el directorio seleccionado.'
        ),
      2000
    )
  ).current;
  const debouncedNotifyRekognitionError = useRef(
    debounce((err) => {
      console.warn(err.toString());
      if (
        err.message == 'The security token included in the request is invalid.'
      ) {
        toast.error(
          'Hubo un error, las credenciales de AWS no son válidas, porfavor configurelas nuevamente en el menú.'
        );
      } else {
        toast.error('Hubo un error, no se pudo reconocer las imagenes en aws');
      }
    }, 4000)
  ).current;
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
    </>
  );
}
