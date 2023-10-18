import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module', function (hooks) {
  setupTest(hooks);

  test('Module model should exist with the right properties', function (assert) {
    // given
    const title = 'Les adresses mail';
    const store = this.owner.lookup('service:store');
    const element = store.createRecord('element', { content: '' });

    // when
    const module = store.createRecord('module', { title, elements: [element] });

    // then
    assert.ok(module);
    assert.strictEqual(module.title, title);
    assert.strictEqual(module.elements.length, 1);
  });
});
