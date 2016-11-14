const Boom = require('boom');
const User = require('../../domain/models/data/user');

module.exports = {

  list(request, reply) {

    User
      .fetchAll()
      .then((users) => reply(users))
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  get(request, reply) {

    new User({ id: request.params.id })
      .fetch()
      .then((user) => reply(user))
      .catch((err) => reply(Boom.badImplementation(err)));
  },

  save(request, reply) {

    new User(request.payload)
      .save()
      .then((user) => reply(user))
      .catch((err) => reply(Boom.badImplementation(err)));
  }

};

