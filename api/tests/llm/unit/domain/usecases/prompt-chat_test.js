import { randomUUID } from 'node:crypto';

import sinon from 'sinon';

import {
  ChatForbiddenError,
  ChatNotFoundError,
  MaxPromptsReachedError,
  PromptAlreadyOngoingError,
  TooLargeMessageInputError,
} from '../../../../../src/llm/domain/errors.js';
import { Chat, Message } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { promptChat } from '../../../../../src/llm/domain/usecases/prompt-chat.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('LLM | Unit | Domain | Usecases | promptChat', function () {
  context('when no chat id provided', function () {
    it('should throw a ChatNotFoundError', async function () {
      // when
      const err = await catchErr(promptChat)({ chatId: null });

      // then
      expect(err).to.be.instanceOf(ChatNotFoundError);
      expect(err.message).to.equal('The chat of id "null id provided" does not exist');
    });
  });

  context('when prompt is already ongoing for given chat', function () {
    it('should throw a PromptAlreadyOngoingError', async function () {
      // given
      const chatId = randomUUID();
      const redisMutex = {
        lock: sinon.stub().resolves(false),
        release: sinon.stub(),
      };

      // when
      const err = await catchErr(promptChat)({ chatId, redisMutex });

      // then
      expect(err).to.be.instanceOf(PromptAlreadyOngoingError);
      expect(err.message).to.equal(`A prompt is already ongoing for chat with id ${chatId}`);
      expect(redisMutex.lock).to.have.been.calledOnce;
      expect(redisMutex.release).not.to.have.been.called;
    });
  });

  context('when chatId does not refer to an existing chat', function () {
    it('should throw a ChatNotFoundError', async function () {
      // given
      const chatId = randomUUID();
      const redisMutex = {
        lock: sinon.stub().resolves(true),
        release: sinon.stub(),
      };
      const chatRepository = {
        get: sinon.stub().resolves(null),
      };

      // when
      const err = await catchErr(promptChat)({
        chatId,
        redisMutex,
        chatRepository,
      });

      // then
      expect(err).to.be.instanceOf(ChatNotFoundError);
      expect(err.message).to.equal(`The chat of id "${chatId}" does not exist`);
    });
  });

  context('when user does not own the chat', function () {
    it('should throw a ChatForbiddenError', async function () {
      // given
      const chatId = randomUUID();
      const chat = new Chat({
        id: chatId,
        userId: 1234,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({ llm: {} }),
        messages: [],
      });
      const redisMutex = {
        lock: sinon.stub().resolves(true),
        release: sinon.stub(),
      };
      const chatRepository = {
        get: sinon.stub().resolves(chat),
      };

      // when
      const err = await catchErr(promptChat)({
        chatId,
        userId: 5678,
        message: 'un message',
        redisMutex,
        chatRepository,
      });

      // then
      expect(err).to.be.instanceOf(ChatForbiddenError);
      expect(err.message).to.equal('User has not the right to use this chat');
    });
  });

  context('checking maxChars limit', function () {
    it('should throw a TooLargeMessageInputError when maxChars is exceeded', async function () {
      // given
      const chatId = randomUUID();
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({
          llm: {},
          challenge: {
            inputMaxChars: 5,
          },
        }),
        messages: [],
      });
      const redisMutex = {
        lock: sinon.stub().resolves(true),
        release: sinon.stub(),
      };
      const chatRepository = {
        get: sinon.stub().resolves(chat),
      };

      // when
      const err = await catchErr(promptChat)({
        chatId,
        userId: 123,
        message: 'un message trop long',
        redisMutex,
        chatRepository,
      });

      // then
      expect(err).to.be.instanceOf(TooLargeMessageInputError);
      expect(err.message).to.equal("You've reached the max characters input");
    });
  });

  context('checking maxPrompts limit', function () {
    it('should throw a MaxPromptsReachedError when user prompts exceed max', async function () {
      // given
      const chatId = randomUUID();
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({
          llm: {},
          challenge: {
            inputMaxPrompts: 1,
          },
        }),
        messages: [
          new Message({ index: 0, content: 'user 1', emitter: 'user' }),
          new Message({ index: 1, content: 'assistant 1', emitter: 'assistant' }),
        ],
      });
      const redisMutex = {
        lock: sinon.stub().resolves(true),
        release: sinon.stub(),
      };
      const chatRepository = {
        get: sinon.stub().resolves(chat),
      };

      // when
      const err = await catchErr(promptChat)({
        chatId,
        userId: 123,
        message: 'un message de trop',
        redisMutex,
        chatRepository,
      });

      // then
      expect(err).to.be.instanceOf(MaxPromptsReachedError);
      expect(err.message).to.equal("You've reached the max prompts authorized");
    });
  });

  context('when error occured after acquiring the lock', function () {
    it('should release the lock', async function () {
      // given
      const redisMutex = {
        lock: sinon.stub().resolves(true),
        release: sinon.stub(),
      };
      const chatRepository = {
        get: sinon.stub().throws(new ChatNotFoundError()),
      };

      // when
      const err = await catchErr(promptChat)({
        chatId: '1-2-3-4',
        userId: 12345,
        message: 'un message',
        redisMutex,
        chatRepository,
      });

      // then
      expect(err).to.be.instanceOf(ChatNotFoundError);
      expect(redisMutex.release).to.have.been.calledOnce;
    });
  });
});
