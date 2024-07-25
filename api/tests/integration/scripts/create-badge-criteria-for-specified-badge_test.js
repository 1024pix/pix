import {
  checkBadgeExistence,
  checkCriteriaFormat,
} from '../../../scripts/create-badge-criteria-for-specified-badge.js';
import { SCOPES } from '../../../src/shared/domain/models/BadgeDetails.js';
import { catchErr, databaseBuilder, expect } from '../../test-helper.js';

describe('Integration | Scripts | create-badge-criteria-for-specified-badge', function () {
  describe('#checkBadgeExistence', function () {
    it('should throw an error if the badge does not exist', async function () {
      // given
      const badgeId = 123;

      // when
      const error = await catchErr(checkBadgeExistence)(badgeId);

      // then
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.equal(`Badge ${badgeId} not found`);
    });

    it('should not throw an error if the badge exists', async function () {
      // given
      const badge = databaseBuilder.factory.buildBadge();
      await databaseBuilder.commit();

      // when
      expect(await checkBadgeExistence(badge.id)).not.to.throw;
    });
  });

  describe('#checkCriteriaFormat', function () {
    context('when badge criteria is valid', function () {
      it('should not throw an error when the scope is CampaignParticipation', function () {
        // given
        const badgeCriteria = [
          {
            threshold: 0,
            scope: SCOPES.CAMPAIGN_PARTICIPATION,
          },
        ];

        // when & then
        expect(checkCriteriaFormat(badgeCriteria)).not.to.throw;
      });
    });

    describe('when one badge criterion is not valid', function () {
      it('should throw an error', async function () {
        // given
        const badgeCriteria = [
          {
            threshold: -1,
            scope: SCOPES.CAMPAIGN_PARTICIPATION,
          },
        ];

        // when
        const error = await catchErr(checkCriteriaFormat)(badgeCriteria);

        // then
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.equal('"threshold" must be greater than or equal to 0');
      });
    });
  });
});
