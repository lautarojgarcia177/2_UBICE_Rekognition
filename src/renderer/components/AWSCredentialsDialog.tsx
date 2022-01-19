import Modal from 'react-modal';
import { Button, Icon, TextInput } from 'react-materialize';
import { useState } from 'react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';

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

export function AWSCredentialsDialog() {

  console.log('aws credentials', window.electron.aws.getCredentials())

  const [modalIsOpen, setIsOpen] = useState(false);
  const [awsCredentials, setAwsCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: ''
  });
  useEffect(() => {
    const _awsCredentials = window.electron.aws.getCredentials();
    setAwsCredentials({
      accessKeyId: _awsCredentials.accessKeyId,
      secreatAccessKey: _awsCredentials.secretAccessKey
    });
  }, [])
  const formik = useFormik({
    initialValues: {
      accessKeyId: awsCredentials.accessKeyId,
      secretAccessKey: awsCredentials.secretAccessKey,
    },
    onSubmit: (values) => {
      const { accessKeyId, secretAccessKey } = values;
      window.electron.aws.setCredentials(accessKeyId, secretAccessKey);
      toast.success('Credenciales de AWS actualizadas'), closeModal();
    },
  });

  function openModal() {
    setIsOpen(true);
    const btn_select_directory = document.getElementsByClassName(
      'button__select_directory'
    )[0];
    if (btn_select_directory) {
      btn_select_directory.classList.add('hide');
    }
    const results_export_buttons = document.getElementById('results_export_buttons');
    if (results_export_buttons) {
      results_export_buttons.classList.add('hide');
    }
  }

  function closeModal() {
    setIsOpen(false);
    const btn_select_directory = document.getElementsByClassName(
      'button__select_directory'
    )[0];
    if (btn_select_directory) {
      btn_select_directory.classList.remove('hide');
    }
    const results_export_buttons = document.getElementById('results_export_buttons');
    if (results_export_buttons) {
      results_export_buttons.classList.remove('hide');
    }
  }

  window.addEventListener('set-aws-credentials', () => {
    openModal();
  });
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Configurar credenciales AWS"
    >
      <h5>Credenciales AWS</h5>
      <form onSubmit={formik.handleSubmit}>
        <div className="input-field">
          <input
            required
            placeholder="Access Key Id"
            id="access_key_id"
            name="accessKeyId"
            type="text"
            className="validate"
            onChange={formik.handleChange}
            value={formik.values.accessKey}
          />
          <input
            required
            placeholder="Secret Access Key"
            id="secret_access_key"
            name="secretAccessKey"
            type="text"
            className="validate"
            onChange={formik.handleChange}
            value={formik.values.secretAccessKey}
          />
        </div>
        <div className="aws-credentials-dialog__buttons">
          <Button
            type="submit"
            floating={false}
            small={true}
            node="button"
            waves="purple"
          >
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
      </form>
    </Modal>
  );
}
