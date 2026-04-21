import sinon from 'sinon';

import { Passage } from '../../../../../src/devcomp/domain/models/Passage.js';
import { startEmbedLlmChat } from '../../../../../src/devcomp/domain/usecases/start-embed-llm-chat.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | start-embed-llm-chat', function () {
  let llmApi, passageRepository;
  const configId = 'uneConfig';
  const passageId = 123456;
  const userId = 456789;

  beforeEach(function () {
    llmApi = {
      startChat: sinon.stub(),
    };
    passageRepository = {
      get: sinon.stub(),
    };
    llmApi.startChat.throws(new Error('llmapi-startchat: Unexpected call'));
    passageRepository.get.throws(new Error('passageRepository-get: Unexpected call'));
  });

  context('when passage does not belong to user', function () {
    it('should throw a DomainError', async function () {
      // given
      passageRepository.get.withArgs({ passageId }).resolves(
        new Passage({
          id: passageId,
          userId: userId + 1,
        }),
      );

      // when
      const err = await catchErr(startEmbedLlmChat)({ configId, passageId, userId, llmApi, passageRepository });

      // then
      expect(err).to.be.instanceOf(DomainError);
      expect(err.message).to.equal('This passage does not belong to user');
    });
  });

  context('success case', function () {
    it('should return the newly created chat', async function () {
      // given
      const moduleId = 'moduleWithLLM';
      passageRepository.get.withArgs({ passageId }).resolves(
        new Passage({
          id: passageId,
          moduleId,
          userId,
        }),
      );
      const someLLMChatDTO = Symbol('LLMCHATDTO');
      llmApi.startChat.withArgs({ configId, userId, passageId, moduleId }).resolves(someLLMChatDTO);

      // when
      const chat = await startEmbedLlmChat({ configId, passageId, userId, llmApi, passageRepository });

      // then
      expect(chat).to.deep.equal(someLLMChatDTO);
    });
  });
});
