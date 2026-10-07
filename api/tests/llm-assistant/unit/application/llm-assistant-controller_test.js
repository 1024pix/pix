import { expect } from 'chai';
import sinon from 'sinon';

import { llmAssistantController } from '../../../../src/llm-assistant/application/llm-assistant-controller.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Llm-Assistant | Unit | Application | llm-assistant-controller', function () {
  describe('#createOrContinueConversation', function () {
    let conversation, dependencies, openedStream;

    beforeEach(function () {
      conversation = Symbol('a-conversation');
      openedStream = Symbol('an-open-stream');
      dependencies = {
        conversationSerializer: { deserialize: sinon.stub().returns(conversation) },
        usecases: { createOrContinueConversation: sinon.stub().resolves(openedStream) },
      };
    });

    it('turns the payload into a conversation before handing it over', async function () {
      // given
      const request = { payload: { messages: [{ role: 'user', content: 'Bonjour' }] } };

      // when
      await llmAssistantController.createOrContinueConversation(request, hFake, dependencies);

      // then
      expect(dependencies.conversationSerializer.deserialize).to.have.been.calledOnceWithExactly(request.payload);
      expect(dependencies.usecases.createOrContinueConversation).to.have.been.calledOnceWithExactly({ conversation });
    });

    it('hands back the stream the usecase opened, untouched', async function () {
      // given
      const request = { payload: { messages: [{ role: 'user', content: 'Bonjour' }] } };

      // when
      const response = await llmAssistantController.createOrContinueConversation(request, hFake, dependencies);

      // then
      expect(response.source).to.equal(openedStream);
    });

    it('announces the stream as a series of events, so the client reads it as one', async function () {
      // given
      const request = { payload: { messages: [{ role: 'user', content: 'Bonjour' }] } };

      // when
      const response = await llmAssistantController.createOrContinueConversation(request, hFake, dependencies);

      // then
      expect(response.contentType).to.equal('text/event-stream');
    });
  });
});
