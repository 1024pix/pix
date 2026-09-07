import Yar from '@hapi/yar';

import { config } from '../../../../config/config.js';

const plugin = Yar;
const options = {
  cookieOptions: {
    isHttpOnly: config.environment !== 'test',
    isSameSite: 'Strict',
    isSecure: config.environment !== 'test',
    password: config.authentication.secret,
  },
  storeBlank: false,
};

export { options, plugin };
