import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { view } from "@forge/bridge";

import '@atlaskit/css-reset';

await view.theme.enable();

const AppWrapper = () => {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

ReactDOM.render(<AppWrapper />, document.getElementById('root'));

