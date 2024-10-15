import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { useEffect, useState } from "react";
import Checklist from './components/Checklist';
import { view } from "@forge/bridge";
import App from './App';

function AppRouter() {
  const [isLoading, setIsLoading] = useState(true);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const getContext = async () => {
        setIsLoading(true)
      const context = await view.getContext();
      setContext(context);
      setIsLoading(false)
    };
    getContext();
  }, []);

  if (isLoading) {
    return (<p>Loading...</p>)
  }
  if (context && context.moduleKey === "project-page") {
    return (<Checklist />);
  } else {
    return <App />
  }
}
export default AppRouter;
