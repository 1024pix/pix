import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | Module | Grain', function (hooks) {
  setupTest(hooks);

  module('#supportedElements', function () {
    test('should filter out not supported elements', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const qcu = { type: 'qcu', isAnswerable: true };
      const qcm = { type: 'qcm', isAnswerable: true };
      const qrocm = { type: 'qrocm', isAnswerable: true };
      const unknown = { type: 'unknown', isAnswerable: false };
      const text = { type: 'text', isAnswerable: false };
      const video = { type: 'video', isAnswerable: false };
      const image = { type: 'image', isAnswerable: false };
      const expectedSupportedElements = [qcu, qcm, qrocm, text, video, image];
      const grain = store.createRecord('grain', { elements: [...expectedSupportedElements, unknown] });

      // when
      const supportedElements = grain.supportedElements;

      // then
      assert.strictEqual(supportedElements.length, expectedSupportedElements.length);
    });
  });
});
