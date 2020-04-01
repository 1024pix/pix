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

  describe('maxTotalSkillsCountInPartnerCompetences', function() {

    it('should calculate max total skills', function() {
      const partnerCompetenceResult1 = store.createRecord('partner-competence-result', {
        totalSkillsCount: 1
      });
      const partnerCompetenceResult2 = store.createRecord('partner-competence-result', {
        totalSkillsCount: 9
      });
      const partnerCompetenceResult3 = store.createRecord('partner-competence-result', {
        totalSkillsCount: 3
      });

      const model = store.createRecord('campaign-participation-result');
      model.set('partnerCompetenceResults', [partnerCompetenceResult1, partnerCompetenceResult2, partnerCompetenceResult3]);

      // when
      const maxTotalSkillsCountInPartnerCompetences = model.get('maxTotalSkillsCountInPartnerCompetences');

      // then
      expect(maxTotalSkillsCountInPartnerCompetences).to.equal(9);
    });
  });
});
