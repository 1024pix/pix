import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Element | Image', function (hooks) {
  setupTest(hooks);

  module(`#hasAlternativeText`, function () {
    test(`should return true if image has an alternativeText`, function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const image = store.createRecord('image', { url: '', alt: '', alternativeText: 'hello' });

      // when & then
      assert.true(image.hasAlternativeText);
    });

    test(`should return false if image has an empty alternativeText`, function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const image = store.createRecord('image', { url: '', alt: '', alternativeText: '' });

      // when & then
      assert.false(image.hasAlternativeText);
    });
  });
});
