import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import { config } from '../../config.js';
import { i18n } from './i18n.js';
import { pino } from './pino.js';
import { sentry } from './sentry.js';

const plugins = [Inert, Vision, i18n, pino, ...(config.sentry.enabled ? [sentry] : [])];

export { plugins };
