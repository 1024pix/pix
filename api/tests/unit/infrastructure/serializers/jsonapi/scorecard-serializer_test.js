const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer');

describe('Unit | Serializer | JSONAPI | scorecard-serializer', () => {

  describe('#serialize()', () => {

    const scorecardObject = domainBuilder.buildUserScorecard();

    const jsonScorecardExpected = {
      data: {
        type: 'scorecards',
        id: scorecardObject.id,
        attributes: {
          name: scorecardObject.name,
          description: scorecardObject.description,
          index: scorecardObject.index,
          'competence-id': scorecardObject.competenceId,
          'earned-pix': scorecardObject.earnedPix,
          level: scorecardObject.level,
          'pix-score-ahead-of-next-level': scorecardObject.pixScoreAheadOfNextLevel,
          status: scorecardObject.status
        },
        relationships: {
          area: {
            data: {
              id: scorecardObject.area.id,
              type: 'areas'
            }
          },
          tutorials: {
            'links': {
              'related': `/api/scorecard/${scorecardObject.id}/tutorials`
            }
          },
        },
      },
      included: [
        {
          attributes: {
            code: scorecardObject.area.code,
            title: scorecardObject.area.title,
          },
          id: scorecardObject.area.id,
          type: 'areas'
        }
      ]
    };

    it('should convert a scorecard object into JSON API data', () => {
      // when
      const json = serializer.serialize(scorecardObject, { ignoreTutorialsRelationshipData: false });

      // then
      expect(json).to.deep.equal(jsonScorecardExpected);
    });

  });
});
