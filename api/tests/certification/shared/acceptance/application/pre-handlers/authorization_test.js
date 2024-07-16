import {
  verifyCertificationSessionAuthorization,
  verifySessionAuthorization,
} from '../../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { NotFoundError } from '../../../../../../src/shared/application/http-errors.js';
import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../../../test-helper.js';

describe('Unit | Pre-handler | Authorization', function () {
  const userId = 1;
  const sessionId = 2;
  let certificationCourseRepository;
  let sessionRepository;
  let dependencies;

  beforeEach(function () {
    certificationCourseRepository = { getSessionId: sinon.stub() };
    sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
    dependencies = { certificationCourseRepository, sessionRepository };
  });

  describe('#verifySessionAuthorization', function () {
    const request = {
      auth: { credentials: { accessToken: 'valid.access.token', userId } },
      params: {
        id: sessionId,
      },
    };

    context('when user has access to session', function () {
      it('should reply with true', async function () {
        // given
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs({ userId, sessionId })
          .resolves(true);

        // when
        const response = await verifySessionAuthorization(request, hFake, dependencies);

        // then
        expect(response).to.deep.equal(true);
      });
    });

    context('when user has no access to session', function () {
      it('should throw a NotFoundError', async function () {
        // given
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs({ userId, sessionId })
          .resolves(false);

        // when
        const error = await catchErr(verifySessionAuthorization)(request, hFake, dependencies);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("Session does not exist or it's access is restricted.");
      });
    });
  });

  describe('#verifyCertificationSessionAuthorization', function () {
    context('When user is allowed to access the session', function () {
      it('should return true', async function () {
        // given
        const userId = 1;
        domainBuilder.buildCertificationCourse({ id: 77, sessionId: 99 });
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId } },
          params: {
            id: 77,
          },
        };
        certificationCourseRepository.getSessionId.withArgs({ id: 77 }).resolves(99);
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs({ userId, sessionId: 99 })
          .resolves(true);

        // when
        const response = await verifyCertificationSessionAuthorization(request, hFake, dependencies);

        // then
        expect(response).to.equal(true);
      });
    });

    context('when user has no access to session', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const userId = 1;
        domainBuilder.buildCertificationCourse({ id: 77, sessionId: 99 });
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId } },
          params: {
            id: 77,
          },
        };
        certificationCourseRepository.getSessionId.withArgs({ id: 77 }).resolves(99);
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs({ userId, sessionId: 99 })
          .resolves(false);

        // when
        const error = await catchErr(verifyCertificationSessionAuthorization)(request, hFake, dependencies);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("Session does not exist or it's access is restricted.");
      });
    });
  });
});
