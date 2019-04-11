const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/competence-evaluation-result-serializer');

describe('Unit | Serializer | JSONAPI | competence-evaluation-result-serializer', () => {

  describe('#serialize()', () => {

    const competenceEvaluationResultObject = domainBuilder.buildUserCompetenceEvaluationResult();

    const jsonCompetenceEvaluationResultExpected = {
      data: {
        type: 'competence-evaluation-results',
        id: competenceEvaluationResultObject.id,
        attributes: {
          name: competenceEvaluationResultObject.name,
          index: competenceEvaluationResultObject.index,
          'course-id': competenceEvaluationResultObject.courseId,
          'earned-pix': competenceEvaluationResultObject.earnedPix,
          level: competenceEvaluationResultObject.level,
          'pix-score-ahead-of-next-level': competenceEvaluationResultObject.pixScoreAheadOfNextLevel
        },
        relationships: {
          area: {
            data: {
              id: competenceEvaluationResultObject.area.id,
              type: 'areas'
            }
          },
        },
      },
      included: [
        {
          attributes: {
            code: competenceEvaluationResultObject.area.code,
            title: competenceEvaluationResultObject.area.title,
          },
          id: competenceEvaluationResultObject.area.id,
          type: 'areas'
        }
      ]
    };

    it('should convert a competence-evaluation-result object into JSON API data', () => {
      // when
      const json = serializer.serialize(competenceEvaluationResultObject);

      // then
      expect(json).to.deep.equal(jsonCompetenceEvaluationResultExpected);
    });

  });
});
