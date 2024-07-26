import * as usecase from '../../../../../src/shared/application/usecases/checkUserIsMemberOfCertificationCenterSession.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Use Case | CheckUserIsMemberOfCertificationCenterSession', function () {
  let certificationCourseRepositoryStub;
  let sessionRepositoryStub;

  beforeEach(function () {
    certificationCourseRepositoryStub = {
      get: sinon.stub(),
    };
    sessionRepositoryStub = {
      doesUserHaveCertificationCenterMembershipForSession: sinon.stub(),
    };
  });

  context('When user is member of certification center session', function () {
    it('should return true', async function () {
      // given
      const userId = 7;
      const certificationCourseId = 1;
      const sessionId = 2;
      const certificationCourse = {
        getSessionId: () => sessionId,
      };

      certificationCourseRepositoryStub.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
      sessionRepositoryStub.doesUserHaveCertificationCenterMembershipForSession
        .withArgs({ userId, sessionId })
        .resolves(true);

      // when
      const response = await usecase.execute({
        userId,
        certificationCourseId,
        dependencies: {
          certificationCourseRepository: certificationCourseRepositoryStub,
          sessionRepository: sessionRepositoryStub,
        },
      });

      // then
      expect(response).to.equal(true);
    });
  });
});
