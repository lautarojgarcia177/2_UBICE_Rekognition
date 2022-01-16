import { Button, Icon } from 'react-materialize';
import { useNavigate } from 'react-router-dom';

export const Results = () => {
  let navigate = useNavigate();
  function goBack() {
    navigate('/');
  }
  const results = (
    <>
      <tr>
        <td>Alvin</td>
        <td>Eclair</td>
      </tr>
      <tr>
        <td>Alan</td>
        <td>
          Jellybean, Jellybean, Jellybean, Jellybean, Jellybean, Jellybean,
          Jellybean, Jellybean, Jellybean, Jellybean, Jellybean, Jellybean,
          Jellybean, Jellybean, Jellybean, Jellybean, Jellybean, Jellybean,
          Jellybean, Jellybean,
        </td>
      </tr>
    </>
  );
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
              <th className="center-align">Imagen</th>
              <th className="center-align">Hallazgos</th>
            </tr>
          </thead>
          <tbody>{results}</tbody>
        </table>
      </div>
      
    </div>
  );
};
