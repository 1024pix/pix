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
    routes,
    logging: true,
    urlPrefix: 'http://localhost:3000',
  };
  const server = createServer(finalConfig);
  server.create('information-banner', 'withoutBanners');

  return server;
}
