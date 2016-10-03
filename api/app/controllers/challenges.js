const base = require('../../config/airtable').base;
const Boom = require('boom');

module.exports = {

  list: {

    handler: (request, reply) => {

      const challenges = [];

      base('Epreuves')
        .select()
        .eachPage((records, fetchNextPage) => {

          challenges.push(records);
          fetchNextPage();
        }, (error) => {

          if (error) {
            return reply(Boom.badImplementation(error));
          }
          return reply(`{"challenges":${JSON.stringify(challenges)}}`).type('application/json');
        });
    }
  },

  get: {

    handler: (request, reply) => {

      base('Epreuves').find(request.params.id, (error, record) => {

        if (error) {
          return reply(Boom.badImplementation(error));
        }
        return reply(`{"challenge":${JSON.stringify(record)}}`).type('application/json');
      });
    }
  }

};
