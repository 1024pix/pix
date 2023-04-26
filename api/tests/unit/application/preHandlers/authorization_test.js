const { expect, sinon, domainBuilder, catchErr, hFake } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/application/http-errors');
const {
  verifyCertificationSessionAuthorization,
  verifySessionAuthorization,
} = require('../../../../lib/application/preHandlers/authorization');

describe('Unit | Pre-handler | Authorization', function () {
  const userId = 1;
  const sessionId = 2;
  let certificationCourseRepository;
  let sessionRepository;
  let dependencies;

  beforeEach(function () {
    certificationCourseRepository = { get: sinon.stub() };
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
          .withArgs(userId, sessionId)
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
          .withArgs(userId, sessionId)
          .resolves(false);

        // when
        const error = await catchErr(verifySessionAuthorization)(request, hFake, dependencies);

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
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs(userId, certificationCourse.getSessionId())
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
        const certificationCourse = domainBuilder.buildCertificationCourse();
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId } },
          params: {
            id: certificationCourse.id,
          },
        };
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs(userId, certificationCourse.getSessionId())
          .resolves(false);

        // when
        const error = await catchErr(verifyCertificationSessionAuthorization)(request, hFake, dependencies);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("La session n'existe pas ou son accès est restreint");
      });
    });
  });
});
