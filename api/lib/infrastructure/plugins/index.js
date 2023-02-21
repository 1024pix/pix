import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import config from '../../config';
import i18n from './i18n';
import pino from './pino';
import sentry from './sentry';

const plugins = [Inert, Vision, i18n, pino, ...(config.sentry.enabled ? [sentry] : [])];

export default plugins;
