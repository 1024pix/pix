import { expect } from 'chai';
import sinon from 'sinon';

import { deserialize } from '../../../../../../src/llm-assistant/infrastructure/serializers/json/conversation-serializer.js';

describe('Llm-Assistant | Unit | Infrastructure | Serializers | conversation-serializer', function () {
  describe('#deserialize', function () {
    it('builds a conversation from the payload', function () {
      // given
      const payload = {
        id: 'a-conversation-id',
        messages: [{ id: 'a-message-id', role: 'user', content: 'Bonjour' }],
      };

      // when
      const conversation = deserialize(payload, '2026-10-06');

      // then
      expect(conversation.id).to.equal('a-conversation-id');
      expect(conversation.messages).to.have.lengthOf(1);
      expect(conversation.messages[0].content).to.equal('Bonjour');
    });

    it('gives an identifier to the conversation and to the messages that carry none', function () {
      // given
      const payload = { messages: [{ role: 'user', content: 'Bonjour' }] };

      // when
      const conversation = deserialize(payload, '2026-10-06');

      // then
      expect(conversation.id).to.be.a('string').and.not.empty;
      expect(conversation.messages[0].id).to.be.a('string').and.not.empty;
    });

    context('when the payload comes from the assistant front', function () {
      it('joins the text parts and ignores the others', function () {
        // given
        const payload = {
          messages: [
            {
              role: 'user',
              parts: [
                { type: 'step-start' },
                { type: 'text', text: 'Bonjour, ' },
                { type: 'reasoning', text: 'ceci ne doit pas remonter' },
                { type: 'text', text: 'comment vas-tu ?' },
              ],
            },
          ],
        };

        // when
        const conversation = deserialize(payload, '2026-10-06');

        // then
        expect(conversation.messages[0].content).to.equal('Bonjour, comment vas-tu ?');
      });

      it('reads the text out of a content given as parts', function () {
        // given
        const payload = {
          messages: [{ role: 'user', content: [{ type: 'text', text: 'Bonjour' }] }],
        };

        // when
        const conversation = deserialize(payload, '2026-10-06');

        // then
        expect(conversation.messages[0].content).to.equal('Bonjour');
      });

      it('ignores a text part whose text is not one', function () {
        // given
        const payload = {
          messages: [
            {
              role: 'user',
              parts: [
                { type: 'text', text: 42 },
                { type: 'text', text: 'Bonjour' },
              ],
            },
          ],
        };

        // when
        const conversation = deserialize(payload, '2026-10-06');

        // then
        expect(conversation.messages[0].content).to.equal('Bonjour');
      });

      it('keeps an empty content when no part carries text', function () {
        // given
        const payload = { messages: [{ role: 'user', parts: [{ type: 'step-start' }] }] };

        // when
        const conversation = deserialize(payload, '2026-10-06');

        // then
        expect(conversation.messages[0].content).to.equal('');
      });
    });

    context('when no day is given', function () {
      let clock;

      afterEach(function () {
        clock.restore();
      });

      it('hands the domain the day it is in France, not the day it is in UTC', function () {
        // given
        clock = sinon.useFakeTimers({ now: new Date('2026-12-31T23:00:00Z'), toFake: ['Date'] });
        const payload = { messages: [{ role: 'user', content: 'Bonjour' }] };

        // when
        const conversation = deserialize(payload);

        // then
        expect(conversation.systemPrompt).to.contain('Date du jour : 2027-01-01.');
      });

      it('hands the domain the current day in summer time as well', function () {
        // given
        clock = sinon.useFakeTimers({ now: new Date('2026-07-14T22:30:00Z'), toFake: ['Date'] });
        const payload = { messages: [{ role: 'user', content: 'Bonjour' }] };

        // when
        const conversation = deserialize(payload);

        // then
        expect(conversation.systemPrompt).to.contain('Date du jour : 2026-07-15.');
      });
    });
  });
});
