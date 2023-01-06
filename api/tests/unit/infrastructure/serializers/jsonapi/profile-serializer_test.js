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
              'competence-id': 'recCOMP123',
              description: 'description',
              'earned-pix': 45,
              'has-not-earned-anything': false,
              'has-not-reached-level-one': false,
              'has-reached-at-least-level-one': true,
              index: '2.3',
              'is-finished': false,
              'is-finished-with-max-level': false,
              'is-improvable': false,
              'is-max-level': true,
              'is-not-started': false,
              'is-progressable': false,
              'is-resettable': false,
              'is-started': true,
              level: 6,
              name: 'Mener une troupe à la bataille',
              'percentage-ahead-of-next-level': 37.5,
              'pix-score-ahead-of-next-level': 3,
              'remaining-days-before-improving': 2,
              'remaining-days-before-reset': 2,
              'remaining-pix-to-next-level': 5,
              'should-wait-before-improving': false,
              status: 'STARTED',
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
              'competence-id': 'recCOMP123',
              description: 'description',
              'earned-pix': 45,
              'has-not-earned-anything': false,
              'has-not-reached-level-one': false,
              'has-reached-at-least-level-one': true,
              index: '2.3',
              'is-finished': false,
              'is-finished-with-max-level': false,
              'is-improvable': false,
              'is-max-level': true,
              'is-not-started': false,
              'is-progressable': false,
              'is-resettable': false,
              'is-started': true,
              level: 6,
              name: 'Mener une troupe à la bataille',
              'percentage-ahead-of-next-level': 37.5,
              'pix-score-ahead-of-next-level': 3,
              'remaining-days-before-improving': 2,
              'remaining-days-before-reset': 2,
              'remaining-pix-to-next-level': 5,
              'should-wait-before-improving': false,
              status: 'STARTED',
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
