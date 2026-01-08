import type { Server } from '@hapi/hapi';
import { container } from '../di.ts';
import type { Request } from '@hapi/hapi';

const register = async function (server: Server) {
  server.route([
    {
      method: 'GET',
      path: '/api/information-banners/{target}',
      options: {
        auth: false,
        cache: false,
        handler: (request: Request) => {
          return container.resolve('bannerController').get(request)
        },
      },
    },
  ]);
};

export const bannerRoute = { name: 'src-banners-api', register };
