const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');

describe('Unit | Serializer | JSONAPI | profile', function () {
  describe('#serialize()', function () {
    it('should convert a scorecard object into JSON API data', function () {
      // given
      const area1 = {
        id: '1',
        code: '1',
        title: '1',
        color: '1',
      };
      const area2 = {
        id: '2',
        code: '2',
        title: '2',
        color: '2',
      };
      const expectedScorecards = [
        domainBuilder.buildUserScorecard({ id: 'rec1', area: area1 }),
        domainBuilder.buildUserScorecard({ id: 'rec2', area: area2 }),
      ];
      const profile = {
        scorecards: expectedScorecards,
        pixScore: 45,
      };

      const expectedSerializedProfile = {
        data: {
          type: 'Profiles',
          attributes: {
            'pix-score': 45,
          },
          relationships: {
            scorecards: {
              data: [
                {
                  id: expectedScorecards[0].id,
                  type: 'scorecards',
                },
                {
                  id: expectedScorecards[1].id,
                  type: 'scorecards',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              code: expectedScorecards[0].area.code,
              title: expectedScorecards[0].area.title,
              color: expectedScorecards[0].area.color,
            },
            id: expectedScorecards[0].area.id,
            type: 'areas',
          },
          {
            attributes: {
              name: expectedScorecards[0].name,
              description: expectedScorecards[0].description,
              index: expectedScorecards[0].index,
              'competence-id': expectedScorecards[0].competenceId,
              'earned-pix': expectedScorecards[0].earnedPix,
              level: expectedScorecards[0].level,
              'pix-score-ahead-of-next-level': expectedScorecards[0].pixScoreAheadOfNextLevel,
              status: expectedScorecards[0].status,
              'remaining-days-before-improving': 2,
              'remaining-days-before-reset': 2,
            },
            id: expectedScorecards[0].id,
            type: 'scorecards',
            relationships: {
              area: {
                data: {
                  id: expectedScorecards[0].area.id,
                  type: 'areas',
                },
              },
            },
          },
          {
            attributes: {
              code: expectedScorecards[1].area.code,
              title: expectedScorecards[1].area.title,
              color: expectedScorecards[1].area.color,
            },
            id: expectedScorecards[1].area.id,
            type: 'areas',
          },
          {
            attributes: {
              name: expectedScorecards[1].name,
              description: expectedScorecards[1].description,
              index: expectedScorecards[1].index,
              'competence-id': expectedScorecards[1].competenceId,
              'earned-pix': expectedScorecards[1].earnedPix,
              level: expectedScorecards[1].level,
              'pix-score-ahead-of-next-level': expectedScorecards[1].pixScoreAheadOfNextLevel,
              status: expectedScorecards[1].status,
              'remaining-days-before-improving': 2,
              'remaining-days-before-reset': 2,
            },
            id: expectedScorecards[1].id,
            type: 'scorecards',
            relationships: {
              area: {
                data: {
                  id: expectedScorecards[1].area.id,
                  type: 'areas',
                },
              },
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(profile);

      // then
      expect(json).to.deep.equal(expectedSerializedProfile);
    });
  });
});
