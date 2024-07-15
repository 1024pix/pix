import { assessmentAuthorization } from '../../../../../src/evaluation/application/pre-handlers/assessment-authorization.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Pre-handler | Assessment Authorization', function () {
  let assessmentRepository;
  let requestResponseUtils;
  let validationErrorSerializer;

  beforeEach(function () {
    assessmentRepository = {
      getByAssessmentIdAndUserId: sinon.stub(),
    };
    requestResponseUtils = { extractUserIdFromRequest: sinon.stub() };
    validationErrorSerializer = {
      serialize: sinon.stub(),
    };
  });

  describe('#verify', function () {
    describe('When user is the owner of the assessment', function () {
      it('should return the assessment', async function () {
        // given
        const request = {
          headers: { authorization: 'VALID_TOKEN' },
          params: {
            id: 8,
          },
        };
        const fetchedAssessment = {};
        const extractedUserId = 100;
        requestResponseUtils.extractUserIdFromRequest.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await assessmentAuthorization.verify(request, hFake, {
          requestResponseUtils,
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
          headers: { authorization: 'VALID_TOKEN' },
          params: {
            id: 8,
          },
        };
        const fetchedAssessment = {};
        const extractedUserId = null;
        requestResponseUtils.extractUserIdFromRequest.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await assessmentAuthorization.verify(request, hFake, {
          requestResponseUtils,
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
          params: {
            id: 8,
          },
        };
        const extractedUserId = 101;
        requestResponseUtils.extractUserIdFromRequest.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.rejects();

        // when
        const response = await assessmentAuthorization.verify(request, hFake, {
          requestResponseUtils,
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
