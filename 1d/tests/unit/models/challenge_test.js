import { module, test } from 'qunit';
import { setupTest } from '../../helpers/index';

module('Unit | Model | Challenge', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#hasValidEmbedDocument', function () {
    test('should be true when all attributes are correctly provided', function (assert) {
      const challenge = store.createRecord('challenge', {
        embedUrl: 'https://pix.fr',
        embedTitle: 'Amazing Pix Embed',
        embedHeight: 800,
      });
      assert.true(challenge.hasValidEmbedDocument);
    });
    test('should be false when embedUrl does not start with "https://"', function (assert) {
      const challenge = store.createRecord('challenge', {
        embedUrl: 'http://pix.fr',
        embedTitle: 'Amazing Pix Embed',
        embedHeight: 800,
      });
      assert.false(challenge.hasValidEmbedDocument);
    });
    test('should be false when embedUrl is not provided', function (assert) {
      const challenge = store.createRecord('challenge', {
        embedTitle: 'Amazing Pix Embed',
        embedHeight: 800,
      });
      assert.false(challenge.hasValidEmbedDocument);
    });
    test('should be false when embedTitle is not provided', function (assert) {
      const challenge = store.createRecord('challenge', {
        embedUrl: 'https://pix.fr',
        embedHeight: 800,
      });
      assert.false(challenge.hasValidEmbedDocument);
    });
    test('should be false when embedHeight is not provided', function (assert) {
      const challenge = store.createRecord('challenge', {
        embedUrl: 'https://pix.fr',
        embedTitle: 'Amazing Pix Embed',
      });
      assert.false(challenge.hasValidEmbedDocument);
    });
  });

  module('#isQROC', function () {
    test('should be true if challenge type is QROC', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QROC',
        autoReply: false,
      });
      assert.true(challenge.isQROC);
    });

    test('should be false if challenge type is not QROC', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QROCM-dep',
        autoReply: false,
      });
      assert.false(challenge.isQROC);
    });

    test('should be false if challenge type is QROC and autoReply set to true', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QROC',
        autoReply: true,
      });
      assert.false(challenge.isQROC);
    });
  });

  module('#isQROCM', function () {
    test('should be true if challenge type is QROCM-dep', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QROCM-dep',
        autoReply: false,
      });
      assert.true(challenge.isQROCM);
    });

    test('should be true if challenge type is QROCM-ind', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QROCM-ind',
        autoReply: false,
      });
      assert.true(challenge.isQROCM);
    });

    test('should be false if challenge type is not QROCM', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCM',
        autoReply: false,
      });
      assert.false(challenge.isQROCM);
    });

    test('should be false if challenge type is QROCM and autoReply set to true', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QROCM-dep',
        autoReply: true,
      });
      assert.false(challenge.isQROCM);
    });
  });

  module('#isQCU', function () {
    test('should be true if challenge type is QCU', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCU',
        autoReply: false,
      });
      assert.true(challenge.isQCU);
    });

    test('should be false if challenge type is not QCU', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCM',
        autoReply: false,
      });
      assert.false(challenge.isQCU);
    });

    test('should be false if challenge type is QCU and autoReply set to true', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCU',
        autoReply: true,
      });
      assert.false(challenge.isQCU);
    });
  });

  module('#isQCM', function () {
    test('should be true if challenge type is QCM', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCM',
        autoReply: false,
      });
      assert.true(challenge.isQCM);
    });

    test('should be true if challenge type is QCMIMG', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCMIMG',
        autoReply: false,
      });
      assert.true(challenge.isQCM);
    });

    test('should be false if challenge type is not QCM', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCU',
        autoReply: false,
      });
      assert.false(challenge.isQCM);
    });

    test('should be false if challenge type is QCM and autoReply set to true', async function (assert) {
      const challenge = store.createRecord('challenge', {
        type: 'QCM',
        autoReply: true,
      });
      assert.false(challenge.isQCM);
    });
  });
});
