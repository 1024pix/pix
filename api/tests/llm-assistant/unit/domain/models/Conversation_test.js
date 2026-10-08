import { expect } from 'chai';

import { Conversation } from '../../../../../src/llm-assistant/domain/models/Conversation.ts';
import { Message } from '../../../../../src/llm-assistant/domain/models/Message.ts';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Llm-Assistant | Unit | Domain | Model | Conversation', function () {
  let userMessage, today;

  beforeEach(function () {
    userMessage = new Message({ id: 'a-message-id', role: 'user', content: 'Bonjour' });
    today = '2026-10-06';
  });

  describe('#constructor', function () {
    it('builds a conversation from its identifier, its messages and the current date', function () {
      // given
      const answered = new Message({ id: 'another-message-id', role: 'assistant', content: 'Bonjour' });
      const askedAgain = new Message({ id: 'a-third-message-id', role: 'user', content: 'Et encore ?' });

      // when
      const conversation = new Conversation({
        id: 'a-conversation-id',
        messages: [userMessage, answered, askedAgain],
        today,
      });

      // then
      expect(conversation.id).to.equal('a-conversation-id');
      expect(conversation.messages).to.deep.equal([userMessage, answered, askedAgain]);
    });

    it('assembles a system prompt carrying the general instructions and the current date', function () {
      // when
      const conversation = new Conversation({ id: 'a-conversation-id', messages: [userMessage], today });

      // then
      expect(conversation.systemPrompt).to.equal(
        'Tu es Pixelle, un assistant pour les équipes de Pix.\nDate du jour : 2026-10-06.',
      );
    });

    it('does not keep a reference on the given messages', function () {
      // given
      const messages = [userMessage];

      // when
      const conversation = new Conversation({ id: 'a-conversation-id', messages, today });
      messages.push(new Message({ id: 'another-message-id', role: 'user', content: 'Encore moi' }));

      // then
      expect(conversation.messages).to.have.lengthOf(1);
    });

    it('throws an EntityValidationError when the identifier is missing', function () {
      // when
      const error = catchErrSync(() => new Conversation({ messages: [userMessage], today }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when the messages are missing', function () {
      // when
      const error = catchErrSync(() => new Conversation({ id: 'a-conversation-id', today }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when no message is held', function () {
      // when
      const error = catchErrSync(() => new Conversation({ id: 'a-conversation-id', messages: [], today }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when the window does not end on a question', function () {
      // given
      const answered = new Message({ id: 'another-message-id', role: 'assistant', content: 'Bonjour' });

      // when
      const error = catchErrSync(
        () => new Conversation({ id: 'a-conversation-id', messages: [userMessage, answered], today }),
      )();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when a message is not a Message', function () {
      // when
      const error = catchErrSync(
        () => new Conversation({ id: 'a-conversation-id', messages: [{ role: 'user', content: 'Bonjour' }], today }),
      )();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when the current day is missing', function () {
      // when
      const error = catchErrSync(() => new Conversation({ id: 'a-conversation-id', messages: [userMessage] }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when the current day trails anything', function () {
      // when
      const error = catchErrSync(
        () => new Conversation({ id: 'a-conversation-id', messages: [userMessage], today: '2026-10-06T08:00:00Z' }),
      )();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when the current day carries anything before it', function () {
      // when
      const error = catchErrSync(
        () => new Conversation({ id: 'a-conversation-id', messages: [userMessage], today: 'le 2026-10-06' }),
      )();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('reports every invalid property at once', function () {
      // when
      const error = catchErrSync(() => new Conversation({ messages: [], today: 'pas un jour' }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
      expect([...new Set(error.invalidAttributes.map(({ attribute }) => attribute))]).to.have.members([
        'id',
        'messages',
        'today',
      ]);
    });
  });

  describe('#messages', function () {
    it('does not let the caller alter the held messages', function () {
      // given
      const conversation = new Conversation({ id: 'a-conversation-id', messages: [userMessage], today });

      // when
      conversation.messages.push(new Message({ id: 'another-message-id', role: 'user', content: 'Encore moi' }));

      // then
      expect(conversation.messages).to.have.lengthOf(1);
    });
  });
});
