import {toast, ToastContainer} from 'react-toastify';

enum ErrorMessages {
  DirectorySelectedNoImagesError = 'No se encontro ninguna imagen jpg, jpeg o png en el directorio seleccionado.',
  InvalidAWSCredentials = 'Hubo un error, las credenciales de AWS no son válidas, porfavor configurelas nuevamente en el menú.',
  AWSRekognitionError = 'Hubo un error, no se pudo reconocer las imagenes en aws'
}

export function ErrorHandler() {
  /* Error listeners */
  window.addEventListener('directory-selected__no-images-error', () => {
    toast.error(ErrorMessages.DirectorySelectedNoImagesError);
  });
  window.addEventListener('rekognition-failure', (event) => {
    const err = event.detail.error;
    if (
      err.message == 'The security token included in the request is invalid.'
    ) {
      toast.error(ErrorMessages.InvalidAWSCredentials);
    } else {
      toast.error(ErrorMessages.AWSRekognitionError);
    }
  });
  return (
    <>
      <ToastContainer
        position="top-center"
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}
