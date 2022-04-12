const { expect, catchErr, databaseBuilder } = require('../../test-helper');
const {
  checkBadgeExistence,
  checkCriteriaFormat,
} = require('../../../scripts/create-badge-criteria-for-specified-badge.js');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');

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
      it('should not throw an error if the scope is SkillSet', function () {
        // given
        const badgeCriteria = [
          {
            threshold: 0,
            scope: BadgeCriterion.SCOPES.SKILL_SET,
            skillSetIds: [1, 2, 3],
          },
        ];

        // when & then
        expect(checkCriteriaFormat(badgeCriteria)).not.to.throw;
      });

      it('should not throw an error when the scope is CampaignParticipation and skillSetIds field is null', function () {
        // given
        const badgeCriteria = [
          {
            threshold: 0,
            scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
            skillSetIds: null,
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
            scope: BadgeCriterion.SCOPES.SKILL_SET,
            skillSetIds: [1, 2, 3],
          },
        ];

        // when
        const error = await catchErr(checkCriteriaFormat)(badgeCriteria);

        // then
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.equal('"threshold" must be greater than or equal to 0');
      });

      context('when scope is CampaignParticipation and skillSetIds are provided', function () {
        it('should throw an error', async function () {
          // given
          const badgeCriteria = [
            {
              threshold: 1,
              scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
              skillSetIds: [1, 2, 3],
            },
          ];

          // when
          const error = await catchErr(checkCriteriaFormat)(badgeCriteria);

          // then
          expect(error).to.be.an.instanceof(Error);
          expect(error.message).to.equal(
            'Badge criterion is invalid : SkillSetIds provided for CampaignParticipation scope'
          );
        });
      });

      context('when scope is SkillSet and skillSetIds are not provided', function () {
        it('should throw an error', async function () {
          // given
          const badgeCriteria = [
            {
              threshold: 1,
              scope: BadgeCriterion.SCOPES.SKILL_SET,
              skillSetIds: null,
            },
          ];

          // when
          const error = await catchErr(checkCriteriaFormat)(badgeCriteria);

          // then
          expect(error).to.be.an.instanceof(Error);
          expect(error.message).to.equal(
            'Badge criterion is invalid : SkillSetIds should be provided for SkillSet scope'
          );
        });
      });
    });
  });
});
