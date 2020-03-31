import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Partner-Competence-Result', function() {

  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const competenceResult = store.createRecord('partner-competence-result');

    expect(competenceResult).to.be.ok;
  });

  describe('totalSkillsCountPercentage', function() {

    it('should retrieve 100 since the competence is the highest number of total skills count', function() {
      const partnerCompetenceResult = store.createRecord('partner-competence-result');
      const otherPartnerCompetenceResult = store.createRecord('partner-competence-result', {
        totalSkillsCount: 1
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        partnerCompetenceResults: [otherPartnerCompetenceResult, partnerCompetenceResult]
      });

      partnerCompetenceResult.totalSkillsCount = 2;
      partnerCompetenceResult.campaignParticipationResult = campaignParticipationResult;

      // when
      const totalSkillsCountPercentage = partnerCompetenceResult.totalSkillsCountPercentage;

      // then
      expect(totalSkillsCountPercentage).to.equal(100);
    });

    it('should retrieve 25 since the competence is not the highest number of total skills count', function() {
      const partnerCompetenceResult = store.createRecord('partner-competence-result');
      const otherPartnerCompetenceResult = store.createRecord('partner-competence-result', {
        totalSkillsCount: 4
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        partnerCompetenceResults: [otherPartnerCompetenceResult, partnerCompetenceResult]
      });

      partnerCompetenceResult.totalSkillsCount = 1;
      partnerCompetenceResult.campaignParticipationResult = campaignParticipationResult;

      // when
      const totalSkillsCountPercentage = partnerCompetenceResult.totalSkillsCountPercentage;

      // then
      expect(totalSkillsCountPercentage).to.equal(25);
    });
  });
});
