import { setupTest } from 'ember-qunit';
import pick from 'lodash/pick';
import { module, test } from 'qunit';

module('Unit | Model | country', function (hooks) {
  setupTest(hooks);

  test('it creates a Country', function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const data = {
      code: '99134',
      name: 'Espagne',
    };

    // when
    const model = store.createRecord('country', data);

    // then
    assert.deepEqual(_pickModelData(data), _pickModelData(model));
  });

  function _pickModelData(country) {
    return pick(country, ['code', 'name']);
  }
});
