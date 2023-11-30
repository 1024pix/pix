import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import {
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionAlreadyFinalizedError,
  SessionWithoutStartedCertificationError,
} from '../../../../src/certification/session/domain/errors.js';

describe('Integration | API | Controller Error', function () {
  let server;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const routeHandler = sinon.stub();

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

  context('409 Conflict', function () {
    const CONFLICT_ERROR = 409;

    it('responds Conflict when a SessionWithAbortReasonOnCompletedCertificationCourseError error occurs', async function () {
      routeHandler.throws(new SessionWithAbortReasonOnCompletedCertificationCourseError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseCode(response)).to.equal('SESSION_WITH_ABORT_REASON_ON_COMPLETED_CERTIFICATION_COURSE');
    });

    it('responds Conflict when a SessionAlreadyFinalizedError error occurs', async function () {
      routeHandler.throws(new SessionAlreadyFinalizedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseCode(response)).to.equal('SESSION_ALREADY_FINALIZED');
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
  });
});
