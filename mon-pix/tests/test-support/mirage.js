import { setupMirage as _setupMirage } from 'ember-mirage/test-support';
import { config } from 'mon-pix/mirage/config';

export function setupMirage(hooks, options) {
  options = options || {};
  return _setupMirage(hooks, { config });
}
