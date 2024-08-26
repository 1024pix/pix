import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | modulix-preview-mode', function (hooks) {
  setupTest(hooks);

  test('it should be disabled by default', function (assert) {
    // when
    const previewMode = this.owner.lookup('service:modulix-preview-mode');

    // then
    assert.false(previewMode.isEnabled);
  });

  test('it enables preview mode', function (assert) {
    // given
    const previewMode = this.owner.lookup('service:modulix-preview-mode');

    // when
    previewMode.enable();

    // then
    assert.true(previewMode.isEnabled);
  });
});
