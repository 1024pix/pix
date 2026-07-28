import sinon from 'sinon';

import { resultsSecurityPreHandlers } from '../../../../../src/certification/results/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('#checkUserOwnsCertificationCourse', function () {
  context('Successful case', function () {
    it('should authorize access to resource when the user owns the certification course', async function () {
      // given
      const preHandlerStub = sinon.stub();
      const checkUserOwnsCertificationCourseUseCaseStub = {
        execute: preHandlerStub.resolves(true),
      };

      // when
      const response = await resultsSecurityPreHandlers.checkUserOwnsCertificationCourse(
        {
          auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
          params: { certificationCourseId: 7 },
        },
        hFake,
        {
          checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
        },
      );

      // then
      expect(response.source).to.be.true;
      expect(preHandlerStub).to.have.been.calledOnceWithExactly({ userId: 123, certificationCourseId: 7 });
    });
  });

  context('Error cases', function () {
    it('should forbid resource access when user does not own the certification course', async function () {
      // given
      const preHandlerStub = sinon.stub();
      const checkUserOwnsCertificationCourseUseCaseStub = {
        execute: preHandlerStub.resolves(false),
      };

      // when
      const response = await resultsSecurityPreHandlers.checkUserOwnsCertificationCourse(
        {
          auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
          params: { certificationCourseId: 5678 },
        },
        hFake,
        {
          checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
        },
      );

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
      expect(preHandlerStub).to.have.been.calledOnceWithExactly({ userId: 1, certificationCourseId: 5678 });
    });

    it('should forbid resource access when an error is thrown by use case', async function () {
      // given
      const preHandlerStub = sinon.stub();
      const checkUserOwnsCertificationCourseUseCaseStub = {
        execute: preHandlerStub.rejects(new Error('Some error')),
      };

      // when
      const response = await resultsSecurityPreHandlers.checkUserOwnsCertificationCourse(
        {
          auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
          params: { certificationCourseId: 5678 },
        },
        hFake,
        {
          checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
        },
      );

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.isTakeOver).to.be.true;
      expect(preHandlerStub).to.have.been.calledOnceWithExactly({ userId: 1, certificationCourseId: 5678 });
    });
  });
});
