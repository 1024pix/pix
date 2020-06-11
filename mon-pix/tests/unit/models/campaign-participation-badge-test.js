import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | CampaignParticipationBadge', function() {

  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const badge = store.createRecord('campaign-participation-badge');

    expect(badge).to.be.ok;
  });

  describe('#maxTotalSkillsCountInPartnerCompetences', function() {
    it('should calculate max total skills', function() {
      const partnerCompetenceResult1 = store.createRecord('partner-competence-result', {
        totalSkillsCount: 2
      });
      const partnerCompetenceResult2 = store.createRecord('partner-competence-result', {
        totalSkillsCount: 10
      });

      const model = store.createRecord('campaign-participation-badge');
      model.set('partnerCompetenceResults', [partnerCompetenceResult1, partnerCompetenceResult2]);

      // when
      const maxTotalSkillsCountInPartnerCompetences = model.get('maxTotalSkillsCountInPartnerCompetences');

      // then
      expect(maxTotalSkillsCountInPartnerCompetences).to.equal(10);
    });
  });

});
