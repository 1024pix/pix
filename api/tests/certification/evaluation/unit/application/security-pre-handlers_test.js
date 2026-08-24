import { expect } from 'chai';
import sinon from 'sinon';

import { evaluationSecurityPreHandlers } from '../../../../../src/certification/evaluation/application/security-pre-handlers.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../tooling/test-utils/error.js';

describe('Certification | Unit | Application | Security Pre Handlers | checkUserOwnsCertificationCourse', function () {
  let securityRepository, dependencies;
  beforeEach(function () {
    securityRepository = { isCertificationLinkedToUser: sinon.stub() };
    preventStubsToBeCalledUnexpectedly([securityRepository.isCertificationLinkedToUser]);
    dependencies = {
      securityRepository,
    };
  });

  context('Successful case', function () {
    it('should authorize access to resource when the user owns the certification course', async function () {
      // given
      securityRepository.isCertificationLinkedToUser.withArgs({ userId: 123, certificationId: 7 }).resolves(true);

      // when
      const response = await evaluationSecurityPreHandlers.checkUserOwnsCertificationCourse(
        {
          auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
          params: { certificationCourseId: 7 },
        },
        hFake,
        dependencies,
      );

      // then
      expect(response.source).to.be.true;
    });
  });

  context('Error cases', function () {
    it('should forbid resource access when user does not own the certification course', async function () {
      // given
      securityRepository.isCertificationLinkedToUser.withArgs({ userId: 123, certificationId: 7 }).resolves(false);

      // when
      const response = await evaluationSecurityPreHandlers.checkUserOwnsCertificationCourse(
        {
          auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
          params: { certificationCourseId: 7 },
        },
        hFake,
        dependencies,
      );

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
    });
  });
});
