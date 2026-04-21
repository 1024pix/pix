import sinon from 'sinon';

import { Passage } from '../../../../../src/devcomp/domain/models/Passage.js';
import { promptToLLMChat } from '../../../../../src/devcomp/domain/usecases/prompt-to-llm-chat.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | prompt-to-llm-chat', function () {
  let llmApi, passageRepository;
  const chatId = 'unChatId';
  const passageId = 123456;
  const userId = 456789;
  const prompt = 'message entrée';
  const attachmentName = 'attachment.pdf';

  beforeEach(function () {
    llmApi = {
      prompt: sinon.stub(),
    };
    passageRepository = {
      get: sinon.stub(),
    };
    llmApi.prompt.throws(new Error('llmapi-prompt: Unexpected call'));
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
      const err = await catchErr(promptToLLMChat)({ chatId, passageId, userId, prompt, llmApi, passageRepository });

      // then
      expect(err).to.be.instanceOf(DomainError);
      expect(err.message).to.equal('This passage does not belong to user');
    });
  });

  context('success case', function () {
    it('should return the stream', async function () {
      // given
      passageRepository.get.withArgs({ passageId }).resolves(
        new Passage({
          id: passageId,
          userId,
        }),
      );
      const stream = Symbol('le stream de réponse du LLM');
      llmApi.prompt.withArgs({ chatId, userId, message: prompt, attachmentName }).resolves(stream);

      // when
      const actualStream = await promptToLLMChat({
        chatId,
        passageId,
        userId,
        prompt,
        attachmentName,
        llmApi,
        passageRepository,
      });

      // then
      expect(actualStream).to.deep.equal(stream);
    });
    it('should coerce falsy values of attachmentName', async function () {
      // given
      passageRepository.get.withArgs({ passageId }).resolves(
        new Passage({
          id: passageId,
          userId,
        }),
      );
      const stream = Symbol('le stream de réponse du LLM');
      llmApi.prompt.withArgs({ chatId, userId, message: prompt, attachmentName: null }).resolves(stream);

      // when
      const actualStream_null = await promptToLLMChat({
        chatId,
        passageId,
        userId,
        prompt,
        attachmentName: null,
        llmApi,
        passageRepository,
      });
      const actualStream_undefined = await promptToLLMChat({
        chatId,
        passageId,
        userId,
        prompt,
        llmApi,
        passageRepository: passageRepository,
      });
      const actualStream_empty = await promptToLLMChat({
        chatId,
        passageId,
        userId,
        prompt,
        attachmentName: '',
        llmApi,
        passageRepository: passageRepository,
      });

      // then
      expect(actualStream_null).to.deep.equal(stream);
      expect(actualStream_undefined).to.deep.equal(stream);
      expect(actualStream_empty).to.deep.equal(stream);
    });
    it('should coerce falsy values of prompt', async function () {
      // given
      passageRepository.get.withArgs({ passageId }).resolves(
        new Passage({
          id: passageId,
          userId,
        }),
      );
      const stream = Symbol('le stream de réponse du LLM');
      llmApi.prompt.withArgs({ chatId, userId, message: null, attachmentName }).resolves(stream);

      // when
      const actualStream_null = await promptToLLMChat({
        chatId,
        passageId,
        userId,
        prompt: null,
        attachmentName,
        llmApi,
        passageRepository: passageRepository,
      });
      const actualStream_undefined = await promptToLLMChat({
        chatId,
        passageId,
        userId,
        attachmentName,
        llmApi,
        passageRepository: passageRepository,
      });
      const actualStream_empty = await promptToLLMChat({
        chatId,
        passageId,
        userId,
        prompt: '',
        attachmentName,
        llmApi,
        passageRepository: passageRepository,
      });

      // then
      expect(actualStream_null).to.deep.equal(stream);
      expect(actualStream_undefined).to.deep.equal(stream);
      expect(actualStream_empty).to.deep.equal(stream);
    });
  });
});
