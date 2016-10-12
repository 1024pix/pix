const Answer = require('../models/answer');

module.exports = {

  list: {
    handler: (request, reply) => {
      Answer
        .fetchAll()
        .then((answers) => {
          reply(`{"answers": ${JSON.stringify(answers)} }`).type('application/json');
        });
    }
  },

  save: {
    handler: (request, reply) => {
      new Answer(request.payload)
        .save()
        .then((answer) => {
          reply(`{"answer": ${JSON.stringify(answer)} }`).type('application/json');
        });
    }
  }

};
