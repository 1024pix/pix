import { setupMirage as emberMirageSetupMirage } from 'ember-mirage/test-support/setup-mirage';

import makeServer from '../../mirage/config';

export function setupMirage(hooks) {
  emberMirageSetupMirage(hooks, {
    createServer: (config) => makeServer({ ...config, environment: 'test' }),
  });
}
