import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CampaignAssessmentParticipationCompetenceResult', function(hooks) {
  setupTest(hooks);

  module('totalSkillsCountPercentage', function() {

    test('should retrieve 100 since the competence is the highest number of total skills count', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign-assessment-participation-competence-result', {});
      const otherCompetenceResult = store.createRecord('campaign-assessment-participation-competence-result', {
        totalSkillsCount: 1
      });
      const campaignAssessmentParticipationResult = store.createRecord('campaign-assessment-participation-result', {
        competenceResults: [otherCompetenceResult, model]
      });

      model.set('totalSkillsCount', 2);
      model.set('campaignAssessmentParticipationResult', campaignAssessmentParticipationResult);

      // when
      const totalSkillsCountPercentage = model.get('totalSkillsCountPercentage');

      // then
      assert.equal(totalSkillsCountPercentage, 100);
    });

    test('should retrieve 25 since the competence is not the highest number of total skills count', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign-assessment-participation-competence-result', {});
      const otherCompetenceResult = store.createRecord('campaign-assessment-participation-competence-result', {
        totalSkillsCount: 4
      });
      const campaignAssessmentParticipationResult = store.createRecord('campaign-assessment-participation-result', {
        competenceResults: [otherCompetenceResult, model]
      });

      model.set('totalSkillsCount', 1);
      model.set('campaignAssessmentParticipationResult', campaignAssessmentParticipationResult);

      // when
      const totalSkillsCountPercentage = model.get('totalSkillsCountPercentage');

      // then
      assert.equal(totalSkillsCountPercentage, 25);
    });
  });

  module('validatedSkillsCountPercentage', function() {

    test('should retrieve 100 since the user has validated all the competence', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign-assessment-participation-competence-result', {});

      model.set('totalSkillsCount', 2);
      model.set('validatedSkillsCount', 2);

      // when
      const validatedSkillsCountPercentage = model.get('validatedSkillsCountPercentage');

      // then
      assert.equal(validatedSkillsCountPercentage, 100);
    });

    test('should retrieve 25 since the user has validated half of the competence', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign-assessment-participation-competence-result', {});

      model.set('totalSkillsCount', 3);
      model.set('validatedSkillsCount', 1);

      // when
      const validatedSkillsCountPercentage = model.get('validatedSkillsCountPercentage');

      // then
      assert.equal(validatedSkillsCountPercentage, 33);
    });
  });
});
