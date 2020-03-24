import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Badge-Partner-Competence-Result', function() {

  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const competenceResult = store.createRecord('badge-partner-competence-result');

    expect(competenceResult).to.be.ok;
  });

  describe('totalSkillsCountPercentage', function() {

    it('should retrieve 100 since the competence is the highest number of total skills count', function() {
      const badgePartnerCompetenceResult = store.createRecord('badge-partner-competence-result');
      const otherBadgePartnerCompetenceResult = store.createRecord('badge-partner-competence-result', {
        totalSkillsCount: 1
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        badgePartnerCompetenceResults: [otherBadgePartnerCompetenceResult, badgePartnerCompetenceResult]
      });

      badgePartnerCompetenceResult.totalSkillsCount = 2;
      badgePartnerCompetenceResult.campaignParticipationResult = campaignParticipationResult;

      // when
      const totalSkillsCountPercentage = badgePartnerCompetenceResult.totalSkillsCountPercentage;

      // then
      expect(totalSkillsCountPercentage).to.equal(100);
    });

    it('should retrieve 25 since the competence is not the highest number of total skills count', function() {
      const badgePartnerCompetenceResult = store.createRecord('badge-partner-competence-result');
      const otherBadgePartnerCompetenceResult = store.createRecord('badge-partner-competence-result', {
        totalSkillsCount: 4
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        badgePartnerCompetenceResults: [otherBadgePartnerCompetenceResult, badgePartnerCompetenceResult]
      });

      badgePartnerCompetenceResult.totalSkillsCount = 1;
      badgePartnerCompetenceResult.campaignParticipationResult = campaignParticipationResult;

      // when
      const totalSkillsCountPercentage = badgePartnerCompetenceResult.totalSkillsCountPercentage;

      // then
      expect(totalSkillsCountPercentage).to.equal(25);
    });
  });
});
