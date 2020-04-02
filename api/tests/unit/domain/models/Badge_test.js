const { expect, domainBuilder } = require('../../../test-helper');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Unit | Domain | Models | Badge', () => {

  const userId = Symbol('userId');
  let campaignParticipationResult = {};
  let badge;

  context('when the badge criteria are fulfilled', function() {

    beforeEach(() => {
      const partnerCompetenceResults = [
        domainBuilder.buildCompetenceResult({
          id: 1,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        }),
        domainBuilder.buildCompetenceResult({
          id: 2,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        }),
      ];
      badge = new Badge(Symbol('Badge id'), partnerCompetenceResults);
      campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
        partnerCompetenceResults: partnerCompetenceResults,
        validatedSkillsCount: 9,
        totalSkillsCount: 10,
        badge
      });
    });

    it('badge should be acquired', async () => {
      // when
      await badge.acquire(userId, campaignParticipationResult);

      // then
      expect(badge.isAcquired()).to.be.equal(true);
    });
  });

  context('when no badge criteria are fulfilled', function() {
    beforeEach(() => {
      const partnerCompetenceResults = [
        domainBuilder.buildCompetenceResult({
          id: 1,
          validatedSkillsCount: 1,
          totalSkillsCount: 10,
        }),
        domainBuilder.buildCompetenceResult({
          id: 2,
          validatedSkillsCount: 3,
          totalSkillsCount: 10,
        }),
      ];
      badge = new Badge(Symbol('Badge id'), partnerCompetenceResults);
      campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
        partnerCompetenceResults: partnerCompetenceResults,
        validatedSkillsCount: 2,
        totalSkillsCount: 10,
        badge
      });

    });

    it('badge should not be acquired', async () => {
      // when
      await badge.acquire(userId, campaignParticipationResult);

      // then
      expect(badge.isAcquired()).to.be.equal(false);
    });
  });

  context('when the campaignParticipationResult badge criterion is not fulfilled', function() {
    beforeEach(() => {
      const partnerCompetenceResults = [
        domainBuilder.buildCompetenceResult({
          id: 1,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        }),
        domainBuilder.buildCompetenceResult({
          id: 2,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        }),
      ];
      badge = new Badge(Symbol('Badge id'), partnerCompetenceResults);
      campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
        badge,
        partnerCompetenceResults: partnerCompetenceResults,
        validatedSkillsCount: 2,
        totalSkillsCount: 10,
      });
    });

    it('badge should not be acquired', async () => {
      // when
      await badge.acquire(userId, campaignParticipationResult);

      // then
      expect(badge.isAcquired()).to.be.equal(false);
    });
  });

  context('when one competenceResult badge criterion is not fulfilled', function() {
    beforeEach(() => {
      const partnerCompetenceResults = [
        domainBuilder.buildCompetenceResult({
          id: 1,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        }),
        domainBuilder.buildCompetenceResult({
          id: 2,
          validatedSkillsCount: 3,
          totalSkillsCount: 10,
        }),
      ];
      badge = new Badge(Symbol('Badge id'), partnerCompetenceResults);
      campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
        badge,
        partnerCompetenceResults: partnerCompetenceResults,
        validatedSkillsCount: 9,
        totalSkillsCount: 10,
      });
    });

    it('badge should not be acquired', async () => {
      // when
      await badge.acquire(userId, campaignParticipationResult);

      // then
      expect(badge.isAcquired()).to.be.equal(false);
    });
  });
});

