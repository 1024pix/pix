import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | campaign-participation-result', function (hooks) {
  setupTest(hooks);

  let store, model;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    model = store.createRecord('campaign-participation-result');
  });

  test('exists', function (assert) {
    assert.ok(model);
  });

  module('cleaBadge', () => {
    test('should be undefined if no badge CLEA', function (assert) {
      assert.strictEqual(model.cleaBadge, undefined);
    });
  });

  module('acquiredBadges', () => {
    module('when at least one acquired badge exists', () => {
      test('should return an array of acquired badges', function (assert) {
        const acquiredBadge = store.createRecord('campaign-participation-badge', { isAcquired: true });
        const notAcquiredBadge = store.createRecord('campaign-participation-badge', { isAcquired: false });

        const campaignParticipationResult = store.createRecord('campaign-participation-result', {
          campaignParticipationBadges: [notAcquiredBadge, acquiredBadge],
        });

        assert.strictEqual(campaignParticipationResult.acquiredBadges.length, 1);
        assert.true(campaignParticipationResult.acquiredBadges[0].isAcquired);
      });
    });

    module('when no acquired badge exists', () => {
      test('should return an empty array', function (assert) {
        const notAcquiredBadge1 = store.createRecord('campaign-participation-badge', { isAcquired: false });
        const notAcquiredBadge2 = store.createRecord('campaign-participation-badge', { isAcquired: false });

        const campaignParticipationResult = store.createRecord('campaign-participation-result', {
          campaignParticipationBadges: [notAcquiredBadge1, notAcquiredBadge2],
        });

        assert.strictEqual(campaignParticipationResult.acquiredBadges.length, 0);
      });
    });
  });

  module('hasReachedStage', () => {
    test('should be false if no reached stage', function (assert) {
      assert.false(model.hasReachedStage);
    });

    test('should be true if has a reached stage', function (assert) {
      model.reachedStage = store.createRecord('reached-stage');
      assert.true(model.hasReachedStage);
    });
  });
});
