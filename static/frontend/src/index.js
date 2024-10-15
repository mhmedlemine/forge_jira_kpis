import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { view } from "@forge/bridge";

import '@atlaskit/css-reset';
import AppRouter from './AppRouter';

await view.theme.enable();

const AppWrapper = () => {
  return (
    <React.StrictMode>
      <AppRouter />
    </React.StrictMode>
  );
};

ReactDOM.render(<AppWrapper />, document.getElementById('root'));