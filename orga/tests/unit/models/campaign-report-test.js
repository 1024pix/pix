import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | campaign report', function(hooks) {
  setupTest(hooks);

  module('#hasStages', () => {
    test('returns true while campaign contains stages', function(assert) {
      const store = this.owner.lookup('service:store');
      const stage = store.createRecord('stage', { threshold: 45 });
      const model = store.createRecord('campaign-report', {
        participationCount: 3,
        sharedParticipationsCount: 1,
        stages: [stage],
      });

      assert.equal(model.hasStages, true);
    });

    test('returns false while campaign does not contain stages', function(assert) {
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('campaign-report', {
        participationCount: 3,
        sharedParticipationsCount: 1,
        stages: [],
      });

      assert.equal(model.hasStages, false);
    });
  });
});
