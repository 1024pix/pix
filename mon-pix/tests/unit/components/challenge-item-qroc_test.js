import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | Challenge item QROC', function (hooks) {
  setupTest(hooks);

  let component;
  module('#_receiveEmbedMessage', function (hooks) {
    hooks.beforeEach(function () {
      const challenge = EmberObject.create({
        autoReply: true,
        id: 'rec_123',
      });

      component = createGlimmerComponent('component:challenge-item-qroc', { challenge });
      component.embedOrigins = ['https://epreuves.pix.fr', 'https://1024pix.github.io', 'https://*.review.pix.fr'];
    });

    module('when the event message is from Pix', function () {
      test('should set the autoreply answer from a string', function (assert) {
        // given
        const answer = 'magicWord';
        const event = {
          data: answer,
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, answer);
      });

      test('should set the autoreply answer from a string object', function (assert) {
        // given
        const answer = 'magicWord';
        const event = {
          data: `{ "answer": "${answer}", "from": "pix"}`,
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, answer);
      });

      test('should set the autoreply answer from a string with number', function (assert) {
        // given
        const answer = '2';
        const event = {
          data: answer,
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, answer);
      });

      test('should set the autoreply answer from a object', function (assert) {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer, from: 'pix' },
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, answer);
      });

      test('should set the autoreply answer from a object with preview origin', function (assert) {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer, from: 'pix' },
          origin: 'https://1024pix.github.io',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, answer);
      });

      test('should set the autoreply answer from a object when the origin is allowed via a wildcard', function (assert) {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer, from: 'pix' },
          origin: 'https://test-pr14.review.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, answer);
      });
    });

    module('when the event message is not from Pix', function () {
      test('should not set the autoreply answer from data in event when origin is not pix', function (assert) {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer, from: 'pix' },
          origin: 'https://epreuves.fake.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, '');
      });

      test('should not set the autoreply answer from data in event when data object is not correct', function (assert) {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer },
          origin: 'https://epreuves.fake.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        assert.deepEqual(component.autoReplyAnswer, '');
      });
    });
  });
});
