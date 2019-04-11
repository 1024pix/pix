const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(competenceEvaluations) {
    return new Serializer('competence-evaluations', {
      transform(current) {
        const competenceEvaluation = Object.assign({}, current);
        competenceEvaluation.assessment = { id: current.assessmentId };
        return competenceEvaluation;
      },
      attributes: ['createdAt', 'updatedAt', 'userId', 'competenceId', 'assessment'],
      assessment: {
        ref: 'id',
        included: false,
      }
    }).serialize(competenceEvaluations);
  },
};
