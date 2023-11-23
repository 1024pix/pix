import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Competence result', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('#masteryRate', function (assert) {
    const competenceResult = store.createRecord('competence-result', {
      masteryPercentage: 70,
    });

    assert.strictEqual(competenceResult.masteryRate, 0.7);
  });

  test('#acquiredStagesCount', function (assert) {
    const competenceResult = store.createRecord('competence-result', {
      reachedStage: 4,
    });

    assert.strictEqual(competenceResult.acquiredStagesCount, 3);
  });
});
