const base = require('../../config/airtable').base;
const Boom = require('boom');

module.exports = {

  list: {
    handler: (request, reply) => {

      const courses = [];

      base('Tests')
        .select({ view: "PIX view" })
        .eachPage((records, fetchNextPage) => {

          courses.push(records);
          fetchNextPage();
        }, (error) => {

          if (error) {
            return reply(Boom.badImplementation(error));
          }
          return reply(`{"courses":${JSON.stringify(courses)}}`).type('application/json');
        });
    }
  },

  get: {
    handler: (request, reply) => {

      base('Tests').find(request.params.id, (error, record) => {

        if (error) {
          return reply(Boom.badImplementation(error));
        }
        return reply(`{"course":${JSON.stringify(record)}}`).type('application/json');
      });
    }
  }

};
