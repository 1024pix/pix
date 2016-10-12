const Assessment = require('../models/assessment');

module.exports = {

  list: {
    handler: (request, reply) => {

      Assessment.fetchAll().then((assessments) => {

        reply({ assessments });
      });
    }
  },

  save: {
    handler: (request, reply) => {
      new Assessment(request.payload)
        .save()
        .then((assessment) => {
          reply({ assessment });
        });
    }
  },

  update: {
    handler: (request, reply) => {
      reply('Todo');
    }
  }

};
