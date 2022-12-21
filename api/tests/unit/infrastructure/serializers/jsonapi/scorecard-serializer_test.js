const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer');

describe('Unit | Serializer | JSONAPI | scorecard-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a scorecard object into JSON API data', function () {
      const expectedTutorials = [
        domainBuilder.buildTutorial({ id: 'recTuto1' }),
        domainBuilder.buildTutorial({ id: 'recTuto2' }),
      ];

      const scorecardObject = domainBuilder.buildUserScorecard({ tutorials: expectedTutorials });

      const expectedSerializedScorecard = {
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
            status: scorecardObject.status,
            'remaining-days-before-improving': 2,
            'remaining-days-before-reset': 2,
          },
          relationships: {
            area: {
              data: {
                id: scorecardObject.area.id,
                type: 'areas',
              },
            },
            tutorials: {
              links: {
                related: `/api/scorecards/${scorecardObject.id}/tutorials`,
              },
            },
          },
        },
        included: [
          {
            attributes: {
              code: scorecardObject.area.code,
              title: scorecardObject.area.title,
              color: scorecardObject.area.color,
            },
            id: scorecardObject.area.id,
            type: 'areas',
          },
          {
            attributes: {
              ...expectedTutorials[0],
            },
            id: expectedTutorials[0].id,
            type: 'tutorials',
          },
          {
            attributes: {
              ...expectedTutorials[1],
            },
            id: expectedTutorials[1].id,
            type: 'tutorials',
          },
        ],
      };

      // when
      const json = serializer.serialize(scorecardObject);

      // then
      expect(json).to.deep.equal(expectedSerializedScorecard);
      expect(json.included[1].attributes).to.deep.equal(expectedTutorials[0]);
      expect(json.included[2].attributes).to.deep.equal(expectedTutorials[1]);
    });
  });
});
