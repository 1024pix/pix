import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | CampaignParticipationBadge', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const badge = store.createRecord('campaign-participation-badge');

    assert.ok(badge);
  });

  module('#maxTotalSkillsCountInSkillSets', function () {
    test('should calculate max total skills', function (assert) {
      const skillSetResult1 = store.createRecord('skill-set-result', {
        totalSkillsCount: 2,
      });
      const skillSetResult2 = store.createRecord('skill-set-result', {
        totalSkillsCount: 10,
      });

      const model = store.createRecord('campaign-participation-badge');
      model.skillSetResults = [skillSetResult1, skillSetResult2];

      // when
      const maxTotalSkillsCountInSkillSets = model.maxTotalSkillsCountInSkillSets;

      // then
      assert.strictEqual(maxTotalSkillsCountInSkillSets, 10);
    });
  });
});
