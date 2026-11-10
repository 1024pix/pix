import { settled } from '@ember/test-helpers';

import makeServer from '../mirage/config';

export function setupMirage(hooks) {
  hooks.beforeEach(function () {
    this.server = makeServer({ environment: 'test' });
    this.server.logging = true;
    window.server = this.server;
  });

  hooks.afterEach(async function () {
    await settled();
    this.server.shutdown();
    delete window.server;
  });
}

export default setupMirage;
