import { countryController } from './country-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/countries',
      config: {
        handler: countryController.findCountries,
        tags: ['api'],
        notes: [
          'Cette route est utilisée par Pix Certif et Pix Admin',
          'Elle renvoie la liste des pays issus du référentiel INSEE.',
        ],
      },
    },
  ]);
};

export const countryRoute = { name: 'shared/certification-cpf-countries-api', register };
