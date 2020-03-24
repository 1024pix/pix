import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Campaign-Participation-Result', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('campaign-participation-result');
    expect(model).to.be.ok;
  });

  describe('maxTotalSkillsCountInCompetences', function() {

    it('should calculate max total skills', function() {
      const competenceResult1 = store.createRecord('competence-result', {
        totalSkillsCount: 2
      });
      const competenceResult2 = store.createRecord('competence-result', {
        totalSkillsCount: 11
      });
      const competenceResult3 = store.createRecord('competence-result', {
        totalSkillsCount: 10
      });

      const model = store.createRecord('campaign-participation-result');
      model.set('competenceResults', [competenceResult1, competenceResult2, competenceResult3]);

      // when
      const maxTotalSkillsCountInCompetences = model.get('maxTotalSkillsCountInCompetences');

      // then
      expect(maxTotalSkillsCountInCompetences).to.equal(11);
    });
  });

  describe('maxTotalSkillsCountInBadgePartnerCompetences', function() {

    it('should calculate max total skills', function() {
      const badgePartnerCompetenceResult1 = store.createRecord('badge-partner-competence-result', {
        totalSkillsCount: 1
      });
      const badgePartnerCompetenceResult2 = store.createRecord('badge-partner-competence-result', {
        totalSkillsCount: 9
      });
      const badgePartnerCompetenceResult3 = store.createRecord('badge-partner-competence-result', {
        totalSkillsCount: 3
      });

      const model = store.createRecord('campaign-participation-result');
      model.set('badgePartnerCompetenceResults', [badgePartnerCompetenceResult1, badgePartnerCompetenceResult2, badgePartnerCompetenceResult3]);

      // when
      const maxTotalSkillsCountInBadgePartnerCompetences = model.get('maxTotalSkillsCountInBadgePartnerCompetences');

      // then
      expect(maxTotalSkillsCountInBadgePartnerCompetences).to.equal(9);
    });
  });
});
