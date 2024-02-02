import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import Yar from '@hapi/yar';

import { config } from '../../config.js';
import * as i18n from './i18n.js';
import * as pino from './pino.js';
import * as sentry from './sentry.js';

const serverSideCookieSessionPlugin = {
  options: {
    cookieOptions: {
      isHttpOnly: config.environment !== 'test',
      isSameSite: 'Strict',
      isSecure: config.environment !== 'test',
      password: config.authentication.secret,
    },
  },
  plugin: Yar,
};

const plugins = [Inert, Vision, i18n, pino, serverSideCookieSessionPlugin, ...(config.sentry.enabled ? [sentry] : [])];

export { plugins };
