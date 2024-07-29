import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | Module | Module', function (hooks) {
  setupTest(hooks);

  test('Module model should exist with the right properties', function (assert) {
    // given
    const title = 'Bien écrire son adresse mail';
    const details = Symbol('details');
    const store = this.owner.lookup('service:store');
    const grain = store.createRecord('grain', {});

    // when
    const module = store.createRecord('module', { title, details, grains: [grain] });

    // then
    assert.ok(module);
    assert.strictEqual(module.title, title);
    assert.strictEqual(module.details, details);
    assert.strictEqual(module.grains[0], grain);
  });
});
