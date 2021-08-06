import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import RequestDocument from './pages/RequestDocument';

class App extends Component {
  render(): React.ReactNode {
    return (
      <ConfigProvider>
        <RequestDocument />
      </ConfigProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);