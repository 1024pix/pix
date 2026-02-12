import { bannerController } from './banner-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/information-banners/{target}',
      options: {
        auth: false,
        handler: bannerController.getInformationBanner,
        cache: {
          otherwise: 'public, max-age=0, s-maxage=86400, must-revalidate',
        },
      },
    },
  ]);
};

const name = 'src-banners-api';
export { name, register };
