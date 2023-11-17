import { expect, domainBuilder } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/scorecard-serializer.js';
import { MAX_REACHABLE_LEVEL } from '../../../../../../lib/domain/constants.js';

describe('Unit | Serializer | JSONAPI | scorecard-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a scorecard object into JSON API data', function () {
      const expectedTutorials = [
        domainBuilder.buildTutorial({ id: 'recTuto1' }),
        domainBuilder.buildTutorial({ id: 'recTuto2' }),
      ];

      const scorecardObject = domainBuilder.buildUserScorecard({
        level: MAX_REACHABLE_LEVEL,
        tutorials: expectedTutorials,
      });

      const expectedSerializedScorecard = {
        data: {
          type: 'scorecards',
          id: scorecardObject.id,
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
            level: MAX_REACHABLE_LEVEL,
            name: 'Mener une troupe à la bataille',
            'percentage-ahead-of-next-level': 37.5,
            'pix-score-ahead-of-next-level': 3,
            'remaining-days-before-improving': 2,
            'remaining-days-before-reset': 2,
            'remaining-pix-to-next-level': 5,
            'should-wait-before-improving': false,
            status: 'STARTED',
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
