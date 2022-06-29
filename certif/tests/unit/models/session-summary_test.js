import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | session-summary', function (hooks) {
  setupTest(hooks);

  module('#statusLabel', function () {
    test('it should return "Finalisée" when status is finalized', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = store.createRecord('session-summary', {
        id: 123,
        status: 'finalized',
      });

      // when/then
      assert.strictEqual(sessionSummary.statusLabel, 'Finalisée');
    });

    test('it should return "Résultats transmis par Pix" when status is processed', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = store.createRecord('session-summary', {
        id: 123,
        status: 'processed',
      });

      // when/then
      assert.strictEqual(sessionSummary.statusLabel, 'Résultats transmis par Pix');
    });

    test('it should return Créée else', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const sessionSummary = store.createRecord('session-summary', {
        id: 123,
        status: 'created',
      });

      // when/then
      assert.strictEqual(sessionSummary.statusLabel, 'Créée');
    });
  });

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
