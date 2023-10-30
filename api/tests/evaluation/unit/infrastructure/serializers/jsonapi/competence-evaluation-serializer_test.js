import { expect, domainBuilder } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/competence-evaluation-serializer.js';

describe('Unit | Serializer | JSONAPI | competence-evaluation-serializer', function () {
  describe('#serialize', function () {
    it('should convert a CompetenceEvaluation model object into JSON API data', function () {
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
            'competence-id': competenceEvaluation.competenceId,
            status: competenceEvaluation.status,
          },
          relationships: {
            assessment: {
              data: {
                id: competenceEvaluation.assessmentId.toString(),
                type: 'assessments',
              },
            },
            scorecard: {
              links: {
                related: `/api/scorecards/${competenceEvaluation.userId}_${competenceEvaluation.competenceId}`,
              },
            },
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
