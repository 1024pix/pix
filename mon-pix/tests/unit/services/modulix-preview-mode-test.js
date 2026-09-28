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

  module('disable', function () {
    test('it disables preview mode', function (assert) {
      // given
      const previewMode = this.owner.lookup('service:modulix-preview-mode');
      previewMode.enable();

      // when
      previewMode.disable();

      // then
      assert.false(previewMode.isEnabled);
    });
  });

  module('isElementsIdButtonEnabled', function () {
    test('it should be disabled by default', function (assert) {
      // when
      const previewMode = this.owner.lookup('service:modulix-preview-mode');

      // then
      assert.false(previewMode.isElementsIdButtonEnabled);
    });
  });

  module('isGrainsTitleButtonEnabled', function () {
    test('it should be disabled by default', function (assert) {
      // when
      const previewMode = this.owner.lookup('service:modulix-preview-mode');

      // then
      assert.false(previewMode.isGrainsTitleButtonEnabled);
    });
  });

  module('toggleElementIdButton', function () {
    test('it switches elements id button state', function (assert) {
      // given
      const previewMode = this.owner.lookup('service:modulix-preview-mode');

      // when
      previewMode.toggleElementIdButton();

      // then
      assert.true(previewMode.isElementsIdButtonEnabled);
    });
  });

  module('toggleGrainsTitleButton', function () {
    test('it switches grains title button state', function (assert) {
      // given
      const previewMode = this.owner.lookup('service:modulix-preview-mode');

      // when
      previewMode.toggleGrainsTitleButton();

      // then
      assert.true(previewMode.isGrainsTitleButtonEnabled);
    });
  });

  module('get isPreviewAndElementsIdButtonEnabled', function () {
    module('when preview mode is not enabled', function () {
      test('it returns false', function (assert) {
        // given
        // when
        const previewMode = this.owner.lookup('service:modulix-preview-mode');

        // then
        assert.false(previewMode.isPreviewAndElementsIdButtonEnabled);
      });
    });

    module('when elements id button is not enabled', function () {
      test('it returns false', function (assert) {
        // given
        const previewMode = this.owner.lookup('service:modulix-preview-mode');

        // when
        previewMode.enable();

        // then
        assert.false(previewMode.isPreviewAndElementsIdButtonEnabled);
      });
    });

    module('when both are enabled', function () {
      test('it returns true', function (assert) {
        // given
        const previewMode = this.owner.lookup('service:modulix-preview-mode');

        // when
        previewMode.enable();
        previewMode.toggleElementIdButton();

        // then
        assert.true(previewMode.isPreviewAndElementsIdButtonEnabled);
      });
    });
  });

  module('get isPreviewAndGrainsTitleButtonEnabled', function () {
    module('when preview mode is not enabled', function () {
      test('it returns false', function (assert) {
        // given
        const previewMode = this.owner.lookup('service:modulix-preview-mode');

        // when
        previewMode.disable();

        // then
        assert.false(previewMode.isPreviewAndGrainsTitleButtonEnabled);
      });
    });

    module('when grains title button is not enabled', function () {
      test('it returns false', function (assert) {
        // given
        const previewMode = this.owner.lookup('service:modulix-preview-mode');

        // when
        previewMode.enable();

        // then
        assert.false(previewMode.isPreviewAndGrainsTitleButtonEnabled);
      });
    });

    module('when both are enabled', function () {
      test('it returns true', function (assert) {
        // given
        const previewMode = this.owner.lookup('service:modulix-preview-mode');

        // when
        previewMode.enable();
        previewMode.toggleGrainsTitleButton();

        // then
        assert.true(previewMode.isPreviewAndGrainsTitleButtonEnabled);
      });
    });
  });
});
