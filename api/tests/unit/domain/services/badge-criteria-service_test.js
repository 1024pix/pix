const { domainBuilder, expect } = require('../../../test-helper');

const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

describe('Unit | Domain | Services | badge-criteria', () => {

  describe('#areBadgeCriteriaFulfilled', () => {
    const badge = domainBuilder.buildBadge();

    let campaignParticipationResult = {};

    context('when the badge criteria are fulfilled', function() {

      beforeEach(() =>  {
        const competenceResults = [
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
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          competenceResults,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        });
      });

      it('should return true', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(true);
      });
    });

    context('when no badge criteria are fulfilled', function() {
      beforeEach(() =>  {
        const competenceResults = [
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
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          competenceResults,
          validatedSkillsCount: 2,
          totalSkillsCount: 10,
        });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when the campaignParticipationResult badge criterion is not fulfilled', function() {
      beforeEach(() =>  {
        const competenceResults = [
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
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          competenceResults,
          validatedSkillsCount: 2,
          totalSkillsCount: 10,
        });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when one competenceResult badge criterion is not fulfilled', function() {
      beforeEach(() =>  {
        const competenceResults = [
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
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          competenceResults,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });
});
