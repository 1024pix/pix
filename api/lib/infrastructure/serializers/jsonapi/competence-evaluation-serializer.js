const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(competenceEvaluations) {
    return new Serializer('competence-evaluations', {
      transform(current) {
        const competenceEvaluation = Object.assign({}, current);
        competenceEvaluation.assessment = { id: current.assessmentId };
        return competenceEvaluation;
      },
      attributes: ['createdAt', 'updatedAt', 'userId', 'competenceId', 'assessment', 'scorecard'],
      assessment: {
        ref: 'id',
        included: false,
      },
      scorecard: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function(record) {
            return `/scorecards/${record.userId}_${record.competenceId}`;
          }
        }
      }
    }).serialize(competenceEvaluations);
  },
};
