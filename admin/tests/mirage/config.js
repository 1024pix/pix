import { pluralize, singularize } from '@warp-drive/utilities/string';
import { createServer } from 'miragejs';

import factories from './factories';
import models from './models';
import routes from './routes';
import serializers from './serializers';

export default function makeServer(config = {}) {
  const finalConfig = {
    ...config,
    models,
    serializers,
    factories,
    inflector: {
      pluralize,
      singularize,
    },
    routes,
    logging: true,
    urlPrefix: 'http://localhost:3000',
  };

  return createServer(finalConfig);
}
