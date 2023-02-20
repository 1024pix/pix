import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/badge-criteria-serializer';
import { expect } from '../../../../test-helper';
import BadgeCriterion from '../../../../../lib/domain/models/BadgeCriterion';

describe('Unit | Serializer | JSONAPI | badge-criteria-serializer', function () {
  describe('#serialize', function () {
    it('should convert a BadgeCriterion model object into JSON API data', function () {
      // given
      const badgeCriterion = new BadgeCriterion({
        scope: 'CampaignParticipation',
        threshold: 65,
        skillSetIds: [],
      });

      // when
      const badgeCriteria = serializer.serialize(badgeCriterion);

      // then
      const expectedBadgeCriterion = {
        data: {
          type: 'badge-criteria',
          attributes: {
            scope: 'CampaignParticipation',
            threshold: 65,
          },
        },
      };

      expect(badgeCriteria).to.deep.equal(expectedBadgeCriterion);
    });
  });
});
