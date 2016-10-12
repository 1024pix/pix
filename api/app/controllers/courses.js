'use strict';

const base = require('../../config/airtable').base;
const Boom = require('boom');

module.exports = {

  list: {
    handler: (request, reply) => {

      let courses = [];

      base('Tests')
        .select({ view: 'PIX view' })
        .eachPage((records, fetchNextPage) => {
          courses = courses.concat(records);
          fetchNextPage();
        }, (error) => {

          if (error) {
            return reply(Boom.badImplementation(error));
          }
          return reply({ courses });
        });
    }
  },

  get: {
    handler: (request, reply) => {

      base('Tests').find(request.params.id, (error, record) => {

        if (error) {
          return reply(Boom.badImplementation(error));
        }
        return reply({ course: record });
      });
    }
  }

};
