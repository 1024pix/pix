const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/competence-evaluation-serializer');

describe('Unit | Serializer | JSONAPI | competence-evaluation-serializer', function() {

  describe('#serialize', function() {

    it('should convert a CompetenceEvaluation model object into JSON API data', function() {
      // given
      const competenceEvaluation = domainBuilder.buildCompetenceEvaluation();

      const expectedSerializedCompetenceEvaluation = {
        data: {
          type: 'competence-evaluations',
          id: competenceEvaluation.id.toString(),
          attributes: {
            'updated-at': new Date(competenceEvaluation.updatedAt),
            'created-at': new Date(competenceEvaluation.createdAt),
            'user-id': competenceEvaluation.userId,
            'assessment-id': competenceEvaluation.assessmentId,
            'competence-id': competenceEvaluation.competenceId,
          },
        },
      };

      // when
      const json = serializer.serialize(competenceEvaluation);

      // then
      expect(json).to.deep.equal(expectedSerializedCompetenceEvaluation);
    });

  });

});
