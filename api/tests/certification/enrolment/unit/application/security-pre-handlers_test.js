import sinon from 'sinon';

import { enrolmentSecurityPreHandlers } from '../../../../../src/certification/enrolment/application/securiy-pre-handlers.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Certification | Enrolment | Application | SecurityPreHandlers', function () {
  describe('#checkUserIsCandidate', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
      request = {
        auth: { credentials: { userId: 1234 } },
        params: {
          certificationCandidateId: 456,
        },
      };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is the certification candidate', async function () {
        // given
        const checkUserIsCandidateUseCaseStub = {
          execute: sinon.stub().resolves(true),
        };
        // when
        const response = await enrolmentSecurityPreHandlers.checkUserIsCandidate(request, hFake, {
          checkUserIsCandidateUseCase: checkUserIsCandidateUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when the user is not the certification candidate', async function () {
        // given
        const checkUserIsCandidateUseCaseStub = {
          execute: sinon.stub().resolves(false),
        };
        // when
        const response = await enrolmentSecurityPreHandlers.checkUserIsCandidate(request, hFake, {
          checkUserIsCandidateUseCase: checkUserIsCandidateUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
