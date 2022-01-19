import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sortedCompetenceResults[0].index, '1.1');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sortedCompetenceResults[1].index, '1.2');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(sortedCompetenceResults[2].index, '4.1');
    });
  });
});
