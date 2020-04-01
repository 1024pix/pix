import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Competence-Result', function() {

  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const competenceResult = store.createRecord('competence-result');

    expect(competenceResult).to.be.ok;
  });

  describe('totalSkillsCountPercentage', function() {

    it('should retrieve 100 since the competence is the highest number of total skills count', function() {
      const competenceResult = store.createRecord('competence-result');
      const otherCompetenceResult = store.createRecord('competence-result', {
        totalSkillsCount: 1
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        competenceResults: [otherCompetenceResult, competenceResult]
      });

      competenceResult.set('totalSkillsCount', 2);
      competenceResult.set('campaignParticipationResult', campaignParticipationResult);

      // when
      const totalSkillsCountPercentage = competenceResult.get('totalSkillsCountPercentage');

      // then
      expect(totalSkillsCountPercentage).to.equal(100);
    });

    it('should retrieve 25 since the competence is not the highest number of total skills count', function() {
      const competenceResult = store.createRecord('competence-result');
      const otherCompetenceResult = store.createRecord('competence-result', {
        totalSkillsCount: 4
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        competenceResults: [otherCompetenceResult, competenceResult]
      });

      competenceResult.set('totalSkillsCount', 1);
      competenceResult.set('campaignParticipationResult', campaignParticipationResult);

      // when
      const totalSkillsCountPercentage = competenceResult.get('totalSkillsCountPercentage');

      // then
      expect(totalSkillsCountPercentage).to.equal(25);
    });
  });
});
