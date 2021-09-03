const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/application/http-errors');
const CertificationSessionAuthorization = require('../../../../lib/application/preHandlers/certification-session-authorization');
const sessionAuthorizationService = require('../../../../lib/domain/services/session-authorization-service');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

describe('Unit | Pre-handler | Certification Session Authorization', function() {

  describe('#verify', function() {
    let userId, certificationCourse, request;

    beforeEach(function() {
      userId = 1;
      certificationCourse = domainBuilder.buildCertificationCourse();
      request = {
        auth: { credentials: { accessToken: 'valid.access.token', userId } },
        params: {
          id: certificationCourse.id,
        },
      };
      sinon.stub(sessionAuthorizationService, 'isAuthorizedToAccessSession');
      sinon.stub(certificationCourseRepository, 'get');
    });

    context('When user is allowed to access the session', function() {

      it('should return true', async function() {
        // given
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId: certificationCourse.getSessionId() }).resolves(true);

        // when
        const response = await CertificationSessionAuthorization.verify(request);

        // then
        expect(response).to.equal(true);
      });
    });

    context('when user has no access to session', function() {

      it('should throw a NotFoundError', async function() {
        // given
        certificationCourseRepository.get.resolves(certificationCourse);
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId: certificationCourse.getSessionId() }).resolves(false);

        // when
        const error = await catchErr(CertificationSessionAuthorization.verify)(request);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('La session n\'existe pas ou son accès est restreint');
      });
    });
  });
});
