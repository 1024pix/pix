import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Challenge', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('challenge');
    assert.ok(model);
  });

  module('Computed property #hasAttachment', function () {
    test('Should be true when challenge has at least one attachment file', function (assert) {
      // given
      const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

      // when
      const hasAttachment = challenge.hasAttachment;

      // then
      assert.true(hasAttachment);
    });

    test('Should be false when challenge has multiple attachment files', function (assert) {
      // given
      const challenge = store.createRecord('challenge', { attachments: [] });

      // when
      const hasAttachment = challenge.hasAttachment;

      // then
      assert.false(hasAttachment);
    });
  });

  module('Computed property #hasSingleAttachment', function () {
    test('Should be true when challenge has only one attachment file', function (assert) {
      // given
      const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

      // when
      const hasSingleAttachment = challenge.hasSingleAttachment;

      // then
      assert.true(hasSingleAttachment);
    });

    test('Should be false when challenge has multiple attachment files', function (assert) {
      // given
      const challenge = store.createRecord('challenge', { attachments: ['file.url', 'file.1.url', 'file.2.url'] });

      // when
      const hasSingleAttachment = challenge.hasSingleAttachment;

      // then
      assert.false(hasSingleAttachment);
    });
  });

  module('Computed property #hasMultipleAttachments', function () {
    test('Should be false when challenge has no attachment file', function (assert) {
      // given
      const challenge = store.createRecord('challenge', { attachments: [] });

      // when
      const hasMultipleAttachments = challenge.hasMultipleAttachments;

      // then
      assert.false(hasMultipleAttachments);
    });

    test('Should be false when challenge has only one attachment file', function (assert) {
      // given
      const challenge = store.createRecord('challenge', { attachments: ['file.url'] });

      // when
      const hasMultipleAttachments = challenge.hasMultipleAttachments;

      // then
      assert.false(hasMultipleAttachments);
    });

    test('Should be true when challenge has multiple attachments files', function (assert) {
      // given
      const challenge = store.createRecord('challenge', { attachments: ['file.url', 'file.1.url', 'file.2.url'] });

      // when
      const hasMultipleAttachments = challenge.hasMultipleAttachments;

      // then
      assert.true(hasMultipleAttachments);
    });
  });

  module('Computed property #hasValidEmbedDocument', function (hooks) {
    let embedOptions;

    hooks.beforeEach(function () {
      embedOptions = {
        embedUrl: 'https://embed.url',
        embedTitle: 'Embed title',
        embedHeight: '600',
      };
    });

    test('should be true when embed data (URL, title and height) are defined', function (assert) {
      // given
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.hasValidEmbedDocument;

      // then
      assert.true(hasValidEmbedDocument);
    });

    test('should be false when embed URL is missing', function (assert) {
      // given
      delete embedOptions.embedUrl;
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.hasValidEmbedDocument;

      // then
      assert.false(hasValidEmbedDocument);
    });

    test('should be false when embed URL is not secured (HTTPS)', function (assert) {
      // given
      embedOptions.embedUrl = 'http://unsecured.url';
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.hasValidEmbedDocument;

      // then
      assert.false(hasValidEmbedDocument);
    });

    test('should be false when embed title is missing', function (assert) {
      // given
      delete embedOptions.embedTitle;
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.hasValidEmbedDocument;

      // then
      assert.false(hasValidEmbedDocument);
    });

    test('should be false when embed height is missing', function (assert) {
      // given
      delete embedOptions.embedHeight;
      const challenge = store.createRecord('challenge', embedOptions);

      // when
      const hasValidEmbedDocument = challenge.hasValidEmbedDocument;

      // then
      assert.false(hasValidEmbedDocument);
    });
  });
});
