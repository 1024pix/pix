import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | campaign-participation-result', function(hooks) {
  setupTest(hooks);

  test('it should have a 100% progression when completed', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('campaign-participation-result', {
      isCompleted: true,
    }));
    assert.equal(model.percentageProgression, 100);
  });

  test('it should have a rounded progression', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('campaign-participation-result', {
      isCompleted: false,
      totalSkillsCount: 11,
      testedSkillsCount: 3
    }));
    assert.equal(model.percentageProgression, 27);
  });
});
