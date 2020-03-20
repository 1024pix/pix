import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | campaign-participation-result', function(hooks) {
  setupTest(hooks);

  module('maxTotalSkillsCountInCompetences', function() {

    test('should calculate max total skills', function(assert) {
      const store = this.owner.lookup('service:store');
      const competenceResult1 = store.createRecord('competence-result', {
        totalSkillsCount: 2
      });
      const competenceResult2 = store.createRecord('competence-result', {
        totalSkillsCount: 11
      });
      const competenceResult3 = store.createRecord('competence-result', {
        totalSkillsCount: 10
      });

      const model = run(() => store.createRecord('campaign-participation-result', {}));
      model.set('competenceResults', [competenceResult1, competenceResult2, competenceResult3]);

      // when
      const maxTotalSkillsCountInCompetences = model.get('maxTotalSkillsCountInCompetences');

      // then
      assert.equal(maxTotalSkillsCountInCompetences, 11);
    });
  });

  module('masteryPercentage', function() {

    test('should calculate total validated skills percentage', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('campaign-participation-result', {}));
      model.set('totalSkillsCount', 45);
      model.set('validatedSkillsCount', 40);

      // when
      const masteryPercentage = model.get('masteryPercentage');

      // then
      assert.equal(masteryPercentage, 89);
    });
  });
});
