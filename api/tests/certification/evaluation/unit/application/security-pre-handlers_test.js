import sinon from 'sinon';

import { evaluationSecurityPreHandlers } from '../../../../../src/certification/evaluation/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Certification | Evaluation | Application | SecurityPreHandlers', function () {
  describe('#checkUserOwnsCertificationCourse', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user owns the certification course', async function () {
        // given
        const preHandlerStub = sinon.stub();
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: preHandlerStub.resolves(true),
        };

        // when
        const response = await evaluationSecurityPreHandlers.checkUserOwnsCertificationCourse(
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
        const response = await evaluationSecurityPreHandlers.checkUserOwnsCertificationCourse(
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
        const response = await evaluationSecurityPreHandlers.checkUserOwnsCertificationCourse(
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

  describe('#checkUserOwnsAssessment', function () {
    let assessmentRepository;
    let validationErrorSerializer;

    beforeEach(function () {
      assessmentRepository = {
        getByAssessmentIdAndUserId: sinon.stub(),
      };
      validationErrorSerializer = { serialize: sinon.stub() };
    });

    describe('When user is the owner of the assessment', function () {
      it('should return the assessment', async function () {
        // given
        const request = {
          headers: generateAuthenticatedUserRequestHeaders({ userId: 100 }),
          params: {
            id: 8,
          },
        };
        const fetchedAssessment = {};
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await evaluationSecurityPreHandlers.checkUserOwnsAssessment(request, hFake, {
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        sinon.assert.calledWith(assessmentRepository.getByAssessmentIdAndUserId, 8, 100);
        expect(response).to.deep.equal({});
      });
    });

    describe('When the assessment has no owner', function () {
      it('should return the assessment', async function () {
        // given
        const request = {
          params: {
            id: 8,
          },
        };
        const fetchedAssessment = {};
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await evaluationSecurityPreHandlers.checkUserOwnsAssessment(request, hFake, {
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        sinon.assert.calledWith(assessmentRepository.getByAssessmentIdAndUserId, 8, null);
        expect(response).to.deep.equal({});
      });
    });

    describe('When user is not the owner of the assessment', function () {
      it('should return a status 401', async function () {
        // given
        const request = {
          headers: generateAuthenticatedUserRequestHeaders({ userId: 101 }),
          params: {
            id: 8,
          },
        };
        assessmentRepository.getByAssessmentIdAndUserId.rejects();

        // when
        const response = await evaluationSecurityPreHandlers.checkUserOwnsAssessment(request, hFake, {
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
