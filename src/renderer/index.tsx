import { render } from 'react-dom';
import App from './App';
import Modal from 'react-modal';

const rootElement = document.getElementById('root')

render(<App />, rootElement);

if (rootElement) {
    Modal.setAppElement(rootElement);
}
