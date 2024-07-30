import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | SharedProfileForCampaign model', function (hooks) {
  let store;

  setupTest(hooks);

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('should return an array of unique areas', function (assert) {
    // given
    const area1 = store.createRecord('area', { code: 1 });
    const area2 = store.createRecord('area', { code: 2 });

    const scorecard1 = store.createRecord('scorecard', { area: area1 });
    const scorecard2 = store.createRecord('scorecard', { area: area1 });
    const scorecard3 = store.createRecord('scorecard', { area: area2 });

    const model = store.createRecord('sharedProfileForCampaign');
    model.scorecards = [scorecard1, scorecard2, scorecard3];

    // when
    const areas = model.areas;

    // then
    assert.deepEqual(
      areas.map((area) => area.get('code')),
      [1, 2],
    );
  });
});
