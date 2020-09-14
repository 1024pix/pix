import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | campaignAssessmentParticipationResult', function(hooks) {
  setupTest(hooks);

  module('maxTotalSkillsCount', function() {

    test('should calculate max total skills', function(assert) {
      const store = this.owner.lookup('service:store');
      const competenceResult1 = store.createRecord('campaign-assessment-participation-competence-result', {
        targetedSkillsCount: 2,
      });
      const competenceResult2 = store.createRecord('campaign-assessment-participation-competence-result', {
        targetedSkillsCount: 11,
      });
      const competenceResult3 = store.createRecord('campaign-assessment-participation-competence-result', {
        targetedSkillsCount: 10,
      });

      const model = store.createRecord('campaign-assessment-participation-result', {});
      model.set('competenceResults', [competenceResult1, competenceResult2, competenceResult3]);

      // when
      const maxTotalSkillsCount = model.get('maxTotalSkillsCount');

      // then
      assert.equal(maxTotalSkillsCount, 11);
    });
  });

  module('sortedCompetenceResults', function() {

    test('should sort competence results', function(assert) {
      const store = this.owner.lookup('service:store');
      const competenceResult1 = store.createRecord('campaign-assessment-participation-competence-result', {
        index: '1.1',
      });
      const competenceResult2 = store.createRecord('campaign-assessment-participation-competence-result', {
        index: '4.1',
      });
      const competenceResult3 = store.createRecord('campaign-assessment-participation-competence-result', {
        index: '1.2',
      });

      const model = store.createRecord('campaign-assessment-participation-result', {
        competenceResults: [competenceResult1, competenceResult2, competenceResult3],
      });

      // when
      const sortedCompetenceResults = model.get('sortedCompetenceResults');

      // then
      assert.equal(sortedCompetenceResults[0].index, '1.1');
      assert.equal(sortedCompetenceResults[1].index, '1.2');
      assert.equal(sortedCompetenceResults[2].index, '4.1');
    });
  });
});
