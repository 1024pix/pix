import { Readable } from 'node:stream';

import sinon from 'sinon';

import * as llmApi from '../../../../../src/llm/application/api/llm-api.js';
import { LLMChatDTO } from '../../../../../src/llm/application/api/models/LLMChatDTO.js';
import { ChatNotFoundError, NoUserIdProvidedError } from '../../../../../src/llm/domain/errors.js';
import { Chat } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { usecases } from '../../../../../src/llm/domain/usecases/index.js';
import { LLMResponseHandler } from '../../../../../src/llm/infrastructure/streaming/llm-response-handler.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('LLM | Unit | Application | API | llm', function () {
  describe('#startChat', function () {
    context('when no user id provided', function () {
      it('throws a NoUserIdProvidedError', async function () {
        // when
        const err = await catchErr(llmApi.startChat)({ configId: 'someConfig', userId: null });

        // then
        expect(err).to.be.instanceOf(NoUserIdProvidedError);
        expect(err.message).to.equal('Must provide a user ID to use LLM API');
      });
    });

    context('when user id provided', function () {
      let startChat, newChat;

      beforeEach(function () {
        newChat = new Chat({
          id: '123e4567-e89b-12d3-a456-426614174000',
          configuration: new Configuration({
            llm: {},
            challenge: {
              inputMaxChars: 456,
              inputMaxPrompts: 789,
              context: 'modulix',
              victoryConditions: {
                expectations: ['expectation'],
              },
            },
            attachment: {
              name: 'file.txt',
            },
          }),
        });
        startChat = sinon.stub(usecases, 'startChat').resolves(newChat);
      });

      it('returns the newly created chat', async function () {
        const configId = 'abc123';
        const userId = 123;
        const challengeId = undefined;
        const assessmentId = undefined;
        const moduleId = undefined;
        const passageId = undefined;

        // when
        const chat = await llmApi.startChat({
          configId,
          userId,
          challengeId,
          assessmentId,
          moduleId,
          passageId,
        });
        // then
        expect(chat).to.deepEqualInstance(
          new LLMChatDTO({
            id: newChat.id,
            attachmentName: newChat.configuration.attachmentName,
            inputMaxChars: newChat.configuration.inputMaxChars,
            inputMaxPrompts: newChat.configuration.inputMaxPrompts,
            hasVictoryConditions: newChat.hasVictoryConditions,
            context: newChat.configuration.context,
          }),
        );
        expect(startChat).to.have.been.calledOnceWithExactly({
          configurationId: configId,
          userId,
          challengeId,
          assessmentId,
          moduleId,
          passageId,
        });
      });

      context('when challenge id, assessment id are provided', function () {
        it('returns the newly created chat', async function () {
          const configId = 'abc123';
          const userId = 123;
          const challengeId = 'fakeChallengeId';
          const assessmentId = 1;
          const moduleId = undefined;
          const passageId = undefined;

          // when
          const chat = await llmApi.startChat({ configId, userId, challengeId, assessmentId, moduleId, passageId });
          // then
          expect(chat).to.deepEqualInstance(
            new LLMChatDTO({
              id: newChat.id,
              attachmentName: newChat.configuration.attachmentName,
              inputMaxChars: newChat.configuration.inputMaxChars,
              inputMaxPrompts: newChat.configuration.inputMaxPrompts,
              hasVictoryConditions: newChat.hasVictoryConditions,
              context: newChat.configuration.context,
            }),
          );
          expect(startChat).to.have.been.calledOnceWithExactly({
            configurationId: configId,
            userId,
            challengeId,
            assessmentId,
            moduleId,
            passageId,
          });
        });
      });

      context('when passage id, module id are provided', function () {
        it('returns the newly created chat', async function () {
          const configId = 'abc123';
          const userId = 123;
          const challengeId = undefined;
          const assessmentId = undefined;
          const moduleId = '550e8400-e29b-41d4-a716-446655440000';
          const passageId = 1;

          // when
          const chat = await llmApi.startChat({ configId, userId, challengeId, assessmentId, moduleId, passageId });
          // then
          expect(chat).to.deepEqualInstance(
            new LLMChatDTO({
              id: newChat.id,
              attachmentName: newChat.configuration.attachmentName,
              inputMaxChars: newChat.configuration.inputMaxChars,
              inputMaxPrompts: newChat.configuration.inputMaxPrompts,
              hasVictoryConditions: newChat.hasVictoryConditions,
              context: newChat.configuration.context,
            }),
          );
          expect(startChat).to.have.been.calledOnceWithExactly({
            configurationId: configId,
            userId,
            challengeId,
            assessmentId,
            moduleId,
            passageId,
          });
        });
      });
    });
  });

  describe('#prompt', function () {
    context('when no chat id provided', function () {
      it('throws a ChatNotFoundError', async function () {
        // given
        const chatId = null;

        // when
        const err = await catchErr(llmApi.prompt)({ chatId, message: 'un message', userId: 12345 });

        // then
        expect(err).to.be.instanceOf(ChatNotFoundError);
        expect(err.message).to.equal('The chat of id "null id provided" does not exist');
      });
    });

    context('when chat id provided', function () {
      let promptChat;

      beforeEach(function () {
        promptChat = sinon.stub(usecases, 'promptChat');
      });

      it('returns response stream', async function () {
        // given
        const chatId = 'chatId';
        const userId = 123;
        const message = 'message';
        const attachmentName = 'attachmentName';

        // when
        const stream = await llmApi.prompt({ chatId, userId, message, attachmentName });

        // then
        expect(stream).to.be.instanceOf(Readable);
        expect(promptChat).to.have.been.calledOnceWith({
          chatId,
          userId,
          message,
          attachmentName,
          llmResponseHandler: sinon.match.instanceOf(LLMResponseHandler),
        });
      });
    });
  });
});
