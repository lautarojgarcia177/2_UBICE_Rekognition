import { Button, Icon } from 'react-materialize';
import { useNavigate } from 'react-router-dom';

const Findings = (props) => {
  return props.findings?.map((finding, index) => (
    <span key={index}>{finding}, </span>
  ));
};

export const Results = () => {
  let navigate = useNavigate();
  function goBack() {
    navigate('/');
  }
  function exportToCSV() {
    window.electron.ipcRenderer.showSaveDialogCSV();
  }
  const results = window.electron.aws
    .getRekognitions()
    .map((rekognized, index) => (
      <tr key={index}>
        <td>{rekognized?.imageFilename}</td>
        <td>
          {rekognized?.findings?.length > 0 && (
            <Findings findings={rekognized?.findings} />
          )}
        </td>
      </tr>
    ));
  return (
    <div>
      <Button
        className="left-align mt-1 ms-1"
        node="button"
        style={{
          marginRight: '5px',
        }}
        waves="light"
        onClick={goBack}
      >
        VOLVER
        <Icon left>arrow_back</Icon>
      </Button>

      <div className="results__table">
        <table className="highlight">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Hallazgos</th>
            </tr>
          </thead>
          <tbody>{results}</tbody>
        </table>
      </div>
      <div id="results_export_buttons" className="mt-2">
        <Button
          node="button"
          style={{
            marginRight: '5px',
          }}
          waves="light"
          onClick={exportToCSV}
        >
          Exportar a CSV
          <Icon left>view_list</Icon>
        </Button>
      </div>
    </div>
  );
};
