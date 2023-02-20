import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import { NotFoundError } from '../../../../lib/application/http-errors';
import {
  verifyCertificationSessionAuthorization,
  verifySessionAuthorization,
} from '../../../../lib/application/preHandlers/authorization';
import certificationCourseRepository from '../../../../lib/infrastructure/repositories/certification-course-repository';
import sessionRepository from '../../../../lib/infrastructure/repositories/sessions/session-repository';

describe('Unit | Pre-handler | Authorization', function () {
  const userId = 1;
  const sessionId = 2;

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
        sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs(userId, sessionId)
          .resolves(true);

        // when
        const response = await verifySessionAuthorization(request);

        // then
        expect(response).to.deep.equal(true);
      });
    });

    context('when user has no access to session', function () {
      it('should throw a NotFoundError', async function () {
        // given
        sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs(userId, sessionId)
          .resolves(false);

        // when
        const error = await catchErr(verifySessionAuthorization)(request);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("La session n'existe pas ou son accès est restreint");
      });
    });
  });

  describe('#verifyCertificationSessionAuthorization', function () {
    context('When user is allowed to access the session', function () {
      it('should return true', async function () {
        // given
        const userId = 1;
        const certificationCourse = domainBuilder.buildCertificationCourse();
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId } },
          params: {
            id: certificationCourse.id,
          },
        };
        sinon.stub(certificationCourseRepository, 'get');
        sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs(userId, certificationCourse.getSessionId())
          .resolves(true);

        // when
        const response = await verifyCertificationSessionAuthorization(request);

        // then
        expect(response).to.equal(true);
      });
    });

    context('when user has no access to session', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const userId = 1;
        const certificationCourse = domainBuilder.buildCertificationCourse();
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId } },
          params: {
            id: certificationCourse.id,
          },
        };
        sinon.stub(certificationCourseRepository, 'get');
        sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs(userId, certificationCourse.getSessionId())
          .resolves(false);
        // when
        const error = await catchErr(verifyCertificationSessionAuthorization)(request);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("La session n'existe pas ou son accès est restreint");
      });
    });
  });
});
