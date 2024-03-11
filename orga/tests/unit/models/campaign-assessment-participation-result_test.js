import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | campaignAssessmentParticipationResult', function (hooks) {
  setupTest(hooks);

  module('sortedCompetenceResults', function () {
    test('should sort competence results', function (assert) {
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
      assert.strictEqual(sortedCompetenceResults[0].index, '1.1');
      assert.strictEqual(sortedCompetenceResults[1].index, '1.2');
      assert.strictEqual(sortedCompetenceResults[2].index, '4.1');
    });
  });
});
