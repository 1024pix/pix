import Inert from '@hapi/inert';
import Vision from '@hapi/vision';

import * as i18n from './i18n.js';
import * as pino from './pino.js';
import * as serverSideCookieSession from './yar.js';

const plugins = [Inert, Vision, i18n, pino, serverSideCookieSession];

export { plugins };
