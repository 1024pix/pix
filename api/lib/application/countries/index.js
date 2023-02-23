const countryController = require('./country-controller.js');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/countries',
      config: {
        handler: countryController.findCountries,
        tags: ['api'],
        notes: [
          'Cette route est utilisée par Pix Certif',
          "Elle renvoie la liste des noms de pays issus du référentiel INSEE dans le cas de l'inscription d'un candidat en certification",
        ],
      },
    },
  ]);
};

exports.name = 'certification-cpf-countries';
