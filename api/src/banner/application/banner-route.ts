import type { Server } from '@hapi/hapi';
import { InformationBannerController } from './banner-controller.ts';

const register = async function (server: Server) {
  server.route([
    {
      method: 'GET',
      path: '/api/information-banners/{target}',
      options: {
        auth: false,
        cache: false,
        handler: InformationBannerController.get,
      },
    },
  ]);
};

export const bannerRoute = { name: 'src-banners-api', register };
