import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(competenceEvaluations) {
    return new Serializer('competence-evaluations', {
      transform(current) {
        const competenceEvaluation = Object.assign({}, current);
        competenceEvaluation.assessment = { id: current.assessmentId };
        return competenceEvaluation;
      },
      attributes: ['createdAt', 'updatedAt', 'userId', 'competenceId', 'assessment', 'scorecard', 'status'],
      assessment: {
        ref: 'id',
        included: false,
      },
      scorecard: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related: function (record) {
            return `/api/scorecards/${record.userId}_${record.competenceId}`;
          },
        },
      },
    }).serialize(competenceEvaluations);
  },
};
