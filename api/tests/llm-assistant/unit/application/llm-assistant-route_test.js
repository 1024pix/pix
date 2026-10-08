import { expect } from 'chai';
import sinon from 'sinon';

import { llmAssistantController } from '../../../../src/llm-assistant/application/llm-assistant-controller.js';
import { llmAssistantRoute } from '../../../../src/llm-assistant/application/llm-assistant-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

const METHOD = 'POST';
const PATH = '/api/admin/llm-assistant/conversations/messages';

describe('Llm-Assistant | Unit | Application | llm-assistant-route', function () {
  describe(`${METHOD} ${PATH}`, function () {
    let httpTestServer;

    beforeEach(async function () {
      await featureToggles.set('isLlmAssistantEnabled', true);
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(llmAssistantController, 'createOrContinueConversation').resolves('ok');

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(llmAssistantRoute);
    });

    it('reaches the controller when the payload holds a window of messages', async function () {
      // when
      const response = await httpTestServer.request(METHOD, PATH, {
        messages: [{ role: 'user', content: 'Bonjour' }],
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(llmAssistantController.createOrContinueConversation).to.have.been.calledOnce;
    });

    it('refuses a payload carrying no messages at all', async function () {
      // when
      const response = await httpTestServer.request(METHOD, PATH, {});

      // then
      expect(response.statusCode).to.equal(400);
      expect(llmAssistantController.createOrContinueConversation).to.not.have.been.called;
    });

    it('refuses a message with no role', async function () {
      // when
      const response = await httpTestServer.request(METHOD, PATH, { messages: [{ content: 'Bonjour' }] });

      // then
      expect(response.statusCode).to.equal(400);
      expect(llmAssistantController.createOrContinueConversation).to.not.have.been.called;
    });

    it('refuses a property the contract does not declare', async function () {
      // when
      const response = await httpTestServer.request(METHOD, PATH, {
        messages: [{ role: 'user', content: 'Bonjour' }],
        sneaky: 'value',
      });

      // then
      expect(response.statusCode).to.equal(400);
      expect(llmAssistantController.createOrContinueConversation).to.not.have.been.called;
    });

    context('when the caller is not a super admin', function () {
      it('does not reach the controller', async function () {
        // given
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) =>
          h
            .response({ errors: [{ code: 'FORBIDDEN' }] })
            .code(403)
            .takeover(),
        );

        // when
        const response = await httpTestServer.request(METHOD, PATH, {
          messages: [{ role: 'user', content: 'Bonjour' }],
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(llmAssistantController.createOrContinueConversation).to.not.have.been.called;
      });
    });

    context('when the feature toggle is off', function () {
      it('answers 503 without reaching the controller', async function () {
        // given
        await featureToggles.set('isLlmAssistantEnabled', false);

        // when
        const response = await httpTestServer.request(METHOD, PATH, {
          messages: [{ role: 'user', content: 'Bonjour' }],
        });

        // then
        expect(response.statusCode).to.equal(503);
        expect(llmAssistantController.createOrContinueConversation).to.not.have.been.called;
      });
    });
  });
});
