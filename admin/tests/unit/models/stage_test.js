import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | stage', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasPrescriberTitle', function () {
    test('when stage has a prescriber title then hasPrescriberTitle should be true', function (assert) {
      // given
      const stage = store.createRecord('stage', { prescriberTitle: 'prescriberTitle' });

      // when
      const hasPrescriberTitle = stage.hasPrescriberTitle;

      // then
      assert.true(hasPrescriberTitle);
    });

    test('when stage does not have a prescriber title then hasPrescriberTitle should be false', function (assert) {
      // given
      const stage = store.createRecord('stage', { prescriberTitle: '' });

      // when
      const hasPrescriberTitle = stage.hasPrescriberTitle;

      // then
      assert.false(hasPrescriberTitle);
    });
  });
  module('#hasPrescriberDescription', function () {
    test('when stage has a prescriber description then hasPrescriberDescription should be true', function (assert) {
      // given
      const stage = store.createRecord('stage', { prescriberDescription: 'prescriberDescription' });

      // when
      const hasPrescriberDescription = stage.hasPrescriberDescription;

      // then
      assert.true(hasPrescriberDescription);
    });

    test('when stage does not have a prescriber description then hasPrescriberDescription should be false', function (assert) {
      // given
      const stage = store.createRecord('stage', { prescriberDescription: '' });

      // when
      const hasPrescriberDescription = stage.hasPrescriberDescription;

      // then
      assert.false(hasPrescriberDescription);
    });
  });
  module('#isTypeLevel', function () {
    test('when stage has level then isTypeLevel should be true', function (assert) {
      // given
      const stage = store.createRecord('stage', { level: 8 });

      // when
      const isTypeLevel = stage.isTypeLevel;

      // then
      assert.true(isTypeLevel);
    });

    test('when stage does not have a level then isTypeLevel should be false', function (assert) {
      // given
      const stage = store.createRecord('stage', { level: null });

      // when
      const isTypeLevel = stage.isTypeLevel;

      // then
      assert.false(isTypeLevel);
    });
  });
});
