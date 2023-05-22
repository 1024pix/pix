import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import { config } from '../../config.js';
import * as i18n from './i18n.js';
import * as pino from './pino.js';
import * as sentry from './sentry.js';

const plugins = [Inert, Vision, i18n, pino, ...(config.sentry.enabled ? [sentry] : [])];

export { plugins };
