import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module', function (hooks) {
  setupTest(hooks);

  test('Module model should exist with the right properties', function (assert) {
    // given
    const title = 'Les adresses mail';
    const store = this.owner.lookup('service:store');
    const elementLesson = store.createRecord('lesson', { content: '' });
    const elementQCU = store.createRecord('qcu', { instruction: '', proposals: [''] });
    const elements = [elementLesson, elementQCU];

    // when
    const module = store.createRecord('module', { title, elements });

    // then
    assert.ok(module);
    assert.strictEqual(module.title, title);
    assert.strictEqual(module.elements.length, elements.length);
  });
});
