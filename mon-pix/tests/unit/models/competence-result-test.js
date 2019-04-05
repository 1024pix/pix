import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Competence-Result', function() {

  setupModelTest('competence-result', {
    needs: ['model:campaign-participation-result']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('totalSkillsCountPercentage', function() {

    it('should retrieve 100 since the competence is the highest number of total skills count', function() {
      const store = this.store();
      const model = this.subject();
      const otherCompetenceResult = store.createRecord('competence-result', {
        totalSkillsCount: 1
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        competenceResults: [otherCompetenceResult, model]
      });

      model.set('totalSkillsCount', 2);
      model.set('campaignParticipationResult', campaignParticipationResult);

      // when
      const totalSkillsCountPercentage = model.get('totalSkillsCountPercentage');

      // then
      expect(totalSkillsCountPercentage).to.equal(100);
    });

    it('should retrieve 25 since the competence is not the highest number of total skills count', function() {
      const store = this.store();
      const model = this.subject();
      const otherCompetenceResult = store.createRecord('competence-result', {
        totalSkillsCount: 4
      });
      const campaignParticipationResult = store.createRecord('campaign-participation-result', {
        competenceResults: [otherCompetenceResult, model]
      });

      model.set('totalSkillsCount', 1);
      model.set('campaignParticipationResult', campaignParticipationResult);

      // when
      const totalSkillsCountPercentage = model.get('totalSkillsCountPercentage');

      // then
      expect(totalSkillsCountPercentage).to.equal(25);
    });
  });

  describe('validatedSkillsPercentage', function() {

    it('should retrieve 100 since the user has validated all the competence', function() {
      const model = this.subject();

      model.set('totalSkillsCount', 2);
      model.set('validatedSkillsCount', 2);

      // when
      const validatedSkillsPercentage = model.get('validatedSkillsPercentage');

      // then
      expect(validatedSkillsPercentage).to.equal(100);
    });

    it('should retrieve 25 since the user has validated half of the competence', function() {
      const model = this.subject();

      model.set('totalSkillsCount', 3);
      model.set('validatedSkillsCount', 1);

      // when
      const validatedSkillsPercentage = model.get('validatedSkillsPercentage');

      // then
      expect(validatedSkillsPercentage).to.equal(33);
    });
  });

  describe('areaColor', function() {

    it('should retrieve domain color style', function() {
      const model = this.subject();

      model.set('index', '5.1');

      // when
      const areaColor = model.get('areaColor');

      // then
      expect(areaColor).to.equal('butterfly-bush');
    });
  });
});
