const User = require('../models/user');

module.exports = {

  list: {
    handler: (request, reply) => {

      User.fetchAll().then((users) => {

        reply(`{"users": ${JSON.stringify(users)} }`).type('application/json');
      });
    }
  },

  get: {
    handler: (request, reply) => {

      new User({ id: request.params.id }).fetch().then((user) => {

        reply(`{"user": ${JSON.stringify(user)} }`).type('application/json');
      });
    }
  },

  save: {
    handler: (request, reply) => {

      const user = new User(request.payload);
      user.save().then(() => {
        reply(`{"user": ${JSON.stringify(user)} }`).type('application/json');
      });

    }
  }
};
