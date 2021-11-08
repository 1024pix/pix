const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/badge-criteria-serializer');
const { expect } = require('../../../../test-helper');
const BadgeCriterion = require('../../../../../lib/domain/models/BadgeCriterion');

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

  describe('#deserialize', function () {
    it('should convert JSON API data into a BadgeCriterion model object', function () {
      // given
      const badgeCriterionPayload = {
        data: {
          type: 'badge-criteria',
          attributes: {
            scope: 'CampaignParticipation',
            threshold: 65,
          },
        },
      };

      // when
      const badgeCriteria = serializer.deserialize(badgeCriterionPayload);

      // then
      const expectedBadgeCriterion = {
        scope: 'CampaignParticipation',
        threshold: 65,
        skillSetIds: [],
      };

      expect(badgeCriteria).to.deep.equal(expectedBadgeCriterion);
    });
  });
});
