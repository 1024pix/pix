import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | session-summary', function (hooks) {
  setupTest(hooks);

  module('#hasEffectiveCandidates', function () {
    test('it should return true when at least one candidate has joined the session', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = store.createRecord('session-summary', {
        effectiveCandidatesCount: 2,
      });

      // when/then
      assert.true(sessionSummary.hasEffectiveCandidates);
    });
    test('it should return false when no candidate has joined the session', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = store.createRecord('session-summary', {
        effectiveCandidatesCount: 0,
      });

      // when/then
      assert.false(sessionSummary.hasEffectiveCandidates);
    });
  });
});
