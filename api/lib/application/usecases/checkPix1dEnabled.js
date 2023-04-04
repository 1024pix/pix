import { config as settings } from '../../config.js';

const execute = async function () {
  return settings.featureToggles.isPix1dEnabled;
};

export { execute };
