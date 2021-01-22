import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | Challenge item qroc', function() {

  setupTest();

  let component;
  describe('#_receiveEmbedMessage', function() {

    beforeEach(() => {
      const challenge = EmberObject.create({
        autoReply: true,
        id: 'rec_123',
      });

      component = createGlimmerComponent('component:challenge-item-qroc', { challenge });
    });

    context('when the event message is from Pix', function() {
      it('should set the autoreply answer from a string', function() {
        // given
        const answer = 'magicWord';
        const event = {
          data: answer,
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        expect(component.autoReplyAnswer).to.deep.equal(answer);
      });

      it('should set the autoreply answer from a string object', function() {
        // given
        const answer = 'magicWord';
        const event = {
          data: `{ "answer": "${answer}", "from": "pix"}`,
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        expect(component.autoReplyAnswer).to.deep.equal(answer);
      });

      it('should set the autoreply answer from a string with number', function() {
        // given
        const answer = '2';
        const event = {
          data: answer,
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        expect(component.autoReplyAnswer).to.deep.equal(answer);
      });
      it('should set the autoreply answer from a object', function() {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer, from: 'pix' },
          origin: 'https://epreuves.pix.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        expect(component.autoReplyAnswer).to.deep.equal(answer);
      });

      it('should set the autoreply answer from a object with preview origin', function() {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer, from: 'pix' },
          origin: 'https://1024pix.github.io',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        expect(component.autoReplyAnswer).to.deep.equal(answer);
      });
    });

    context('when the event message is not from Pix', function() {

      it('should not set the autoreply answer from data in event when origin is not pix', function() {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer, from: 'pix' },
          origin: 'https://epreuves.fake.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        expect(component.autoReplyAnswer).to.deep.equal('');
      });

      it('should not set the autoreply answer from data in event when data object is not correct', function() {
        // given
        const answer = 'magicWord';
        const event = {
          data: { answer },
          origin: 'https://epreuves.fake.fr',
        };

        // when
        component._receiveEmbedMessage(event);

        // then
        expect(component.autoReplyAnswer).to.deep.equal('');
      });
    });
  });

});
