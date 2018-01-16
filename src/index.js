import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Alerts from './Alerts';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Alerts />, document.getElementById('root'));
registerServiceWorker();
