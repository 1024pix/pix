import { bannerController } from './banner-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/information-banners/{target}',
      options: {
        auth: false,
        handler: bannerController.getInformationBanner,
        cache: false,
      },
    },
  ]);
};

export const bannerRoute = { name: 'banner/banner-api', register };
