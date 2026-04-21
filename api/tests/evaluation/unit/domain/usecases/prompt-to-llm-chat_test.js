import sinon from 'sinon';

import { promptToLLMChat } from '../../../../../src/evaluation/domain/usecases/prompt-to-llm-chat.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Eval | Domain | UseCases | prompt-to-llm-chat', function () {
  let llmApi, assessmentRepository;
  const chatId = 'unChatId';
  const assessmentId = 123456;
  const userId = 456789;
  const prompt = 'message entrée';
  const attachmentName = 'attachment.pdf';

  beforeEach(function () {
    llmApi = {
      prompt: sinon.stub(),
    };
    assessmentRepository = {
      get: sinon.stub(),
    };
    llmApi.prompt.throws(new Error('llmapi-prompt: Unexpected call'));
    assessmentRepository.get.throws(new Error('assessmentRepository-get: Unexpected call'));
  });

  context('when passage does not belong to user', function () {
    it('should throw a DomainError', async function () {
      // given
      assessmentRepository.get.withArgs(assessmentId).resolves(
        new Assessment({
          id: assessmentId,
          userId: userId + 1,
        }),
      );

      // when
      const err = await catchErr(promptToLLMChat)({
        chatId,
        assessmentId,
        userId,
        prompt,
        llmApi,
        assessmentRepository: assessmentRepository,
      });

      // then
      expect(err).to.be.instanceOf(DomainError);
      expect(err.message).to.equal('This assessment does not belong to user');
    });
  });

  context('success case', function () {
    it('should return the stream', async function () {
      // given
      assessmentRepository.get.withArgs(assessmentId).resolves(
        new Assessment({
          id: assessmentId,
          userId,
        }),
      );
      const stream = Symbol('le stream de réponse du LLM');
      llmApi.prompt.withArgs({ chatId, userId, message: prompt, attachmentName }).resolves(stream);

      // when
      const actualStream = await promptToLLMChat({
        chatId,
        assessmentId,
        userId,
        prompt,
        attachmentName,
        llmApi,
        assessmentRepository: assessmentRepository,
      });

      // then
      expect(actualStream).to.deep.equal(stream);
    });
    it('should coerce falsy values of attachmentName', async function () {
      // given
      assessmentRepository.get.withArgs(assessmentId).resolves(
        new Assessment({
          id: assessmentId,
          userId,
        }),
      );
      const stream = Symbol('le stream de réponse du LLM');
      llmApi.prompt.withArgs({ chatId, userId, message: prompt, attachmentName: null }).resolves(stream);

      // when
      const actualStream_null = await promptToLLMChat({
        chatId,
        assessmentId,
        userId,
        prompt,
        attachmentName: null,
        llmApi,
        assessmentRepository: assessmentRepository,
      });
      const actualStream_undefined = await promptToLLMChat({
        chatId,
        assessmentId,
        userId,
        prompt,
        llmApi,
        assessmentRepository: assessmentRepository,
      });
      const actualStream_empty = await promptToLLMChat({
        chatId,
        assessmentId,
        userId,
        prompt,
        attachmentName: '',
        llmApi,
        assessmentRepository: assessmentRepository,
      });

      // then
      expect(actualStream_null).to.deep.equal(stream);
      expect(actualStream_undefined).to.deep.equal(stream);
      expect(actualStream_empty).to.deep.equal(stream);
    });
    it('should coerce falsy values of prompt', async function () {
      // given
      assessmentRepository.get.withArgs(assessmentId).resolves(
        new Assessment({
          id: assessmentId,
          userId,
        }),
      );
      const stream = Symbol('le stream de réponse du LLM');
      llmApi.prompt.withArgs({ chatId, userId, message: null, attachmentName }).resolves(stream);

      // when
      const actualStream_null = await promptToLLMChat({
        chatId,
        assessmentId,
        userId,
        prompt: null,
        attachmentName,
        llmApi,
        assessmentRepository: assessmentRepository,
      });
      const actualStream_undefined = await promptToLLMChat({
        chatId,
        assessmentId,
        userId,
        attachmentName,
        llmApi,
        assessmentRepository: assessmentRepository,
      });
      const actualStream_empty = await promptToLLMChat({
        chatId,
        assessmentId,
        userId,
        prompt: '',
        attachmentName,
        llmApi,
        assessmentRepository: assessmentRepository,
      });

      // then
      expect(actualStream_null).to.deep.equal(stream);
      expect(actualStream_undefined).to.deep.equal(stream);
      expect(actualStream_empty).to.deep.equal(stream);
    });
  });
});
