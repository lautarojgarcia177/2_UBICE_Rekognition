import { toast, ToastContainer } from 'react-toastify';

export function ErrorHandler() {
  /* Error listeners */
  window.addEventListener('directory-selected__no-images-error', () => {
    toast.error(
      'No se encontro ninguna imagen jpg, jpeg o png en el directorio seleccionado.'
    );
  });
  window.addEventListener('rekognition-failure', (event) => {
    const err = event.detail.error;
    if (
      err.message == 'The security token included in the request is invalid.'
    ) {
      toast.error(
        'Hubo un error, las credenciales de AWS no son válidas, porfavor configurelas nuevamente en el menú.'
      );
    } else {
      toast.error('Hubo un error, no se pudo reconocer las imagenes en aws');
    }
  });
  return (
    <>
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}
