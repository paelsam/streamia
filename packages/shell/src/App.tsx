import { SharedStoreProvider } from './store/SharedStore';
import { AppRouter } from './router/AppRouter';
import './styles/global.scss';
import { createLogger } from '@streamia/shared/utils';

const logger = createLogger('Shell-App');

function App() {
  logger.info('Shell application initialized');

  return (
    <SharedStoreProvider>
      <AppRouter />
    </SharedStoreProvider>
  );
}

export default App;
