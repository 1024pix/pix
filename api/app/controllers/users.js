'use strict';

const User = require('../models/data/user');

module.exports = {

  list: {
    handler: (request, reply) => {

      User
        .fetchAll()
        .then((users) => reply(users));
    }
  },

  get: {
    handler: (request, reply) => {

      new User({ id: request.params.id })
        .fetch()
        .then((user) => reply(user));
    }
  },

  save: {
    handler: (request, reply) => {

      new User(request.payload)
        .save()
        .then(() => reply(user));
    }
  }
};
