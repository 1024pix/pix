import sinon from 'sinon';

import { sessionPublicationController } from '../../../../../src/certification/session-management/application/session-publication-controller.js';
import { SessionPublicationBatchResult } from '../../../../../src/certification/session-management/domain/models/SessionPublicationBatchResult.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { SessionPublicationBatchError } from '../../../../../src/shared/application/http-errors.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Certification | Session-management | Unit | Application | Controller | Session Publication', function () {
  describe('#publish', function () {
    it('should return the serialized session', async function () {
      // given
      const sessionId = 123;
      const session = Symbol('session');
      const serializedSession = Symbol('serializedSession');
      const sessionManagementSerializer = { serialize: sinon.stub() };
      sinon.stub(usecases, 'publishSession').withArgs({ sessionId }).resolves(session);
      sessionManagementSerializer.serialize.withArgs({ session }).resolves(serializedSession);

      // when
      const response = await sessionPublicationController.publish(
        {
          params: {
            id: sessionId,
          },
          payload: {
            data: { attributes: { toPublish: true } },
          },
        },
        hFake,
        { sessionManagementSerializer },
      );

      // then
      expect(response).to.equal(serializedSession);
    });
  });

  describe('#unpublish', function () {
    it('should return the serialized session', async function () {
      // given
      const sessionId = 123;
      const session = Symbol('session');
      const serializedSession = Symbol('serializedSession');
      const sessionManagementSerializer = { serialize: sinon.stub() };

      sinon
        .stub(usecases, 'unpublishSession')
        .withArgs({
          sessionId,
        })
        .resolves(session);
      sessionManagementSerializer.serialize.withArgs({ session }).resolves(serializedSession);

      // when
      const response = await sessionPublicationController.unpublish(
        {
          params: {
            sessionId,
          },
          payload: {
            data: { attributes: { toPublish: false } },
          },
        },
        hFake,
        { sessionManagementSerializer },
      );

      // then
      expect(response).to.equal(serializedSession);
    });
  });

  describe('#publishInBatch', function () {
    it('returns 204 when no error occurred', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon
        .stub(usecases, 'publishSessionsInBatch')
        .withArgs({ sessionIds: ['sessionId1', 'sessionId2'] })
        .resolves(new SessionPublicationBatchResult('batchId'));

      // when
      const response = await sessionPublicationController.publishInBatch(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('logs errors when errors occur', async function () {
      // given
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));
      result.addPublicationError('sessionId2', new Error('another error'));

      const request = {
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').resolves(result);
      sinon.stub(logger, 'warn');

      // when
      await catchErr(sessionPublicationController.publishInBatch)(request, hFake);

      // then
      expect(logger.warn).to.have.been.calledWithExactly(
        'One or more error occurred when publishing session in batch batchId',
      );

      expect(logger.warn).to.have.been.calledWithExactly(
        {
          batchId: 'batchId',
          sessionId: 'sessionId1',
        },
        'an error',
      );

      expect(logger.warn).to.have.been.calledWithExactly(
        {
          batchId: 'batchId',
          sessionId: 'sessionId2',
        },
        'another error',
      );
    });

    it('returns the serialized batch id', async function () {
      // given
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));

      const request = {
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').resolves(result);
      sinon.stub(logger, 'warn');

      // when
      const error = await catchErr(sessionPublicationController.publishInBatch)(request, hFake);

      // then
      expect(error).to.be.an.instanceof(SessionPublicationBatchError);
    });
  });
});
