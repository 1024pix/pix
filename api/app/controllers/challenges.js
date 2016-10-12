const base = require('../../config/airtable').base;
const Boom = require('boom');

module.exports = {

  get: {

    handler: (request, reply) => {

      base('Epreuves').find(request.params.id, (error, record) => {

        if (error) {
          return reply(Boom.badImplementation(error));
        }
        return reply({ challenge: record });
      });
    }
  }

};
