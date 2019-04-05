const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(competenceEvaluation) {
    return new Serializer('competence-evaluations', {
      attributes: ['createdAt', 'updatedAt', 'userId', 'competenceId', 'assessmentId'],
    }).serialize(competenceEvaluation);
  },
};
