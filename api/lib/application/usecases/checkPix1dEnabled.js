import { config as settings } from '../../../src/shared/config.js';

const execute = async function () {
  return settings.featureToggles.isPix1dEnabled;
};

export { execute };
