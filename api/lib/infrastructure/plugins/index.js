import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import config from '../../config';

const plugins = [
  Inert,
  Vision,
  require('./i18n'),
  require('./pino'),
  ...(config.sentry.enabled ? [require('./sentry')] : []),
];

export default plugins;
