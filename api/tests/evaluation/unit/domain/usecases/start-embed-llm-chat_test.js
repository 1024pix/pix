import sinon from 'sinon';

import { startEmbedLlmChat } from '../../../../../src/evaluation/domain/usecases/start-embed-llm-chat.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Eval | Domain | UseCases | start-embed-llm-chat', function () {
  let llmApi, assessmentRepository;
  const configId = 'uneConfig';
  const assessmentId = 123456;
  const userId = 456789;

  beforeEach(function () {
    llmApi = {
      startChat: sinon.stub(),
    };
    assessmentRepository = {
      get: sinon.stub(),
    };
    llmApi.startChat.throws(new Error('llmapi-startchat: Unexpected call'));
    assessmentRepository.get.throws(new Error('assessmentRepository-get: Unexpected call'));
  });

  context('when assessment does not belong to user', function () {
    it('should throw a DomainError', async function () {
      // given
      assessmentRepository.get.withArgs(assessmentId).resolves(
        new Assessment({
          id: assessmentId,
          userId: userId + 1,
        }),
      );

      // when
      const err = await catchErr(startEmbedLlmChat)({ configId, assessmentId, userId, llmApi, assessmentRepository });

      // then
      expect(err).to.be.instanceOf(DomainError);
      expect(err.message).to.equal('This assessment does not belong to user');
    });
  });

  context('success case', function () {
    it('should return the newly created chat', async function () {
      // given
      const challengeId = 'challengeWithLLM';
      assessmentRepository.get.withArgs(assessmentId).resolves(
        new Assessment({
          id: assessmentId,
          userId,
          lastChallengeId: challengeId,
        }),
      );
      const someLLMChatDTO = Symbol('LLMCHATDTO');
      llmApi.startChat.withArgs({ configId, userId, assessmentId, challengeId }).resolves(someLLMChatDTO);

      // when
      const chat = await startEmbedLlmChat({ configId, assessmentId, userId, llmApi, assessmentRepository });

      // then
      expect(chat).to.deep.equal(someLLMChatDTO);
    });
  });
});
