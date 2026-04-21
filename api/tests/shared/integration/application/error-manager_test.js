import sinon from 'sinon';

import {
  SessionAlreadyFinalizedError,
  SessionWithoutStartedCertificationError,
} from '../../../../src/certification/session-management/domain/errors.js';
import * as LLMDomainErrors from '../../../../src/llm/domain/errors.js';
import { SiecleXmlImportError } from '../../../../src/prescription/learner-management/domain/errors.js';
import * as DomainErrors from '../../../../src/shared/domain/errors.js';

import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Integration | API | Controller Error', function () {
  let server, routeHandler;

  const routeUrl = '/test_route';
  const request = { method: 'GET', url: routeUrl };

  function responseDetail(response) {
    const payload = JSON.parse(response.payload);
    return payload.errors[0].detail;
  }

  function responseCode(response) {
    const payload = JSON.parse(response.payload);
    return payload.errors[0].code;
  }

  before(async function () {
    routeHandler = sinon.stub();
    const moduleUnderTest = {
      name: 'test-route',
      register: async function (server) {
        server.route([
          {
            method: 'GET',
            path: routeUrl,
            handler: routeHandler,
            config: {
              auth: false,
            },
          },
        ]);
      },
    };
    server = new HttpTestServer({ mustThrowOn5XXError: false });
    await server.register(moduleUnderTest);
  });

  context('412 Precondition Failed', function () {
    const PRECONDITION_FAILED = 412;

    it('responds Precondition Failed when a SiecleXmlImportError error occurs', async function () {
      routeHandler.throws(new SiecleXmlImportError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });
  });

  context('409 Conflict', function () {
    const CONFLICT_ERROR = 409;

    it('responds Conflict when a SessionAlreadyFinalizedError error occurs', async function () {
      routeHandler.throws(new SessionAlreadyFinalizedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseCode(response)).to.equal('SESSION_ALREADY_FINALIZED');
    });

    it('responds Conflict when a PromptAlreadyOngoingError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.PromptAlreadyOngoingError('chatId'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseDetail(response)).to.equal('A prompt is already ongoing for chat with id chatId');
    });
  });

  context('400 Bad Request', function () {
    const BAD_REQUEST_ERROR = 400;

    it('responds Bad Request when a SessionWithoutStartedCertificationError error occurs', async function () {
      routeHandler.throws(new SessionWithoutStartedCertificationError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal(
        "This session hasn't started, you can't finalise it. However, you can delete it.",
      );
      expect(responseCode(response)).to.equal('SESSION_WITHOUT_STARTED_CERTIFICATION');
    });

    it('responds Bad Request when a InvalidSessionResultTokenError error occurs', async function () {
      routeHandler.throws(new DomainErrors.InvalidSessionResultTokenError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal(
        'The token used to retrieve the results of the certification session is invalid.',
      );
      expect(responseCode(response)).to.equal('INVALID_SESSION_RESULT_TOKEN');
    });

    it('responds Bad Request when a LLMDomainErrors.ConfigurationNotFoundError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.ConfigurationNotFoundError('someConfigId'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('The configuration of id "someConfigId" does not exist');
    });

    it('responds Bad Request when a LLMDomainErrors.NoUserIdProvidedError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.NoUserIdProvidedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('Must provide a user ID to use LLM API');
    });

    it('responds Bad Request when a LLMDomainErrors.NoAttachmentNeededError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.NoAttachmentNeededError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal(
        'Attachment has been provided but is not expected for the given configuration',
      );
    });

    it('responds Bad Request when a LLMDomainErrors.NoAttachmentNorMessageProvidedError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.NoAttachmentNorMessageProvidedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('At least a message or an attachment, if applicable, must be provided');
    });
  });

  context('403 Forbidden', function () {
    const FORBIDDEN_ERROR = 403;

    it('responds Forbidden when a UserNotAuthorizedToAccessEntityError error occurs', async function () {
      routeHandler.throws(new DomainErrors.UserNotAuthorizedToAccessEntityError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('Utilisateur non autorisé à accéder à la ressource');
    });

    it('responds Forbidden when a UserNotAuthorizedToUpdatePasswordError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserNotAuthorizedToUpdatePasswordError(
          "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.",
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal(
        "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.",
      );
    });

    it('responds Forbidden when a LLMDomainErrors.MaxPromptsReachedError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.MaxPromptsReachedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal("You've reached the max prompts authorized");
    });

    it('responds Forbidden when a LLMDomainErrors.ChatForbiddenError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.ChatForbiddenError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('User has not the right to use this chat');
    });
  });

  context('404 Not found', function () {
    const NOT_FOUND_ERROR = 404;

    it('responds Not Found when a LLMDomainErrors.ChatNotFoundError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.ChatNotFoundError('someChatId'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal('The chat of id "someChatId" does not exist');
    });
  });

  context('500 Internal server error', function () {
    const INTERNAL_SERVER_ERROR = 500;

    it('responds Internal server error when a LLMDomainErrors.IncorrectMessagesOrderingError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.IncorrectMessagesOrderingError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(INTERNAL_SERVER_ERROR);
      expect(responseDetail(response)).to.equal('Messages must respect the ordering enforced by LLM providers');
    });
  });

  context('503 Service Unavailable', function () {
    const SERVICE_UNAVAILABLE_ERROR = 503;

    it('responds Service Unavailable when a LLMDomainErrors.LLMApiError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.LLMApiError('some error message'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(SERVICE_UNAVAILABLE_ERROR);
      expect(responseDetail(response)).to.equal('Something went wrong when reaching the LLM Api : some error message');
    });
  });

  context('413 Payload Too Large', function () {
    const PAYLOAD_TOO_LARGE_ERROR = 413;

    it('responds Payload too large when a LLMDomainErrors.TooLargeMessageInputError error occurs', async function () {
      routeHandler.throws(new LLMDomainErrors.TooLargeMessageInputError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PAYLOAD_TOO_LARGE_ERROR);
      expect(responseDetail(response)).to.equal("You've reached the max characters input");
    });
  });
});
