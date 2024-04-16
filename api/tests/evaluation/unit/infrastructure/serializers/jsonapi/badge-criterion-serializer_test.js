import * as serializer from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/badge-criterion-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | badge-criterion-serializer', function () {
  describe('#deserialize', function () {
    it('should convert JSON API data to BadgeCriterion model object', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'badge-criteria',
          attributes: {
            id: 1,
            'capped-tubes': [{ id: 10, level: 2 }],
            name: 'Criterion name',
            scope: 'CAMPAIGN_PARTICIPATION',
            threshold: 66,
          },
          relationships: {
            badge: {
              data: {
                type: 'badges',
                id: 111,
              },
            },
          },
        },
      };

      // when
      const badgeCriterion = await serializer.deserialize(jsonTraining);

      // then
      expect(badgeCriterion).to.deep.equal({
        id: 1,
        badgeId: 111,
        cappedTubes: [{ id: 10, level: 2 }],
        name: 'Criterion name',
        scope: 'CAMPAIGN_PARTICIPATION',
        threshold: 66,
      });
    });
  });
});
