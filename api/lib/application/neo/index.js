const Joi = require('joi');
const neoController = require('./neo-controller');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/neo/users',
      config: {
        auth: false,
        handler: neoController.createUser,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'neo-api';
