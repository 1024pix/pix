import { expect, sinon, hFake } from '../../../test-helper.js';
import { assessmentAuthorization as AssessmentAuthorization } from '../../../../lib/application/preHandlers/assessment-authorization.js';

describe('Unit | Pre-handler | Assessment Authorization', function () {
  describe('#verify', function () {
    const request = {
      headers: { authorization: 'VALID_TOKEN' },
      params: {
        id: 8,
      },
    };
    let requestResponseUtils;
    let assessmentRepository;
    let validationErrorSerializer;

    beforeEach(function () {
      requestResponseUtils = {
        extractUserIdFromRequest: sinon.stub(),
      };
      assessmentRepository = {
        getByAssessmentIdAndUserId: sinon.stub(),
      };
      validationErrorSerializer = {
        serialize: sinon.stub(),
      };
    });

    it('should get userId from token', async function () {
      // given
      requestResponseUtils.extractUserIdFromRequest.returns('userId');
      assessmentRepository.getByAssessmentIdAndUserId.resolves();
      validationErrorSerializer.serialize.returns();

      // when
      await AssessmentAuthorization.verify(request, hFake, {
        requestResponseUtils,
        assessmentRepository,
        validationErrorSerializer,
      });

      // then
      expect(requestResponseUtils.extractUserIdFromRequest).to.have.been.calledWith(request);
    });

    describe('When assessment is linked to userId (userId exist)', function () {
      it('should reply with assessment', async function () {
        // given
        const fetchedAssessment = {};
        const extractedUserId = 'userId';
        requestResponseUtils.extractUserIdFromRequest.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await AssessmentAuthorization.verify(request, hFake, {
          requestResponseUtils,
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        sinon.assert.calledOnce(assessmentRepository.getByAssessmentIdAndUserId);
        sinon.assert.calledWith(assessmentRepository.getByAssessmentIdAndUserId, request.params.id, extractedUserId);
        expect(response).to.deep.equal(fetchedAssessment);
      });
    });

    describe('When assessment is linked a null userId', function () {
      it('should reply with assessment', async function () {
        // given
        const fetchedAssessment = {};
        const extractedUserId = null;
        requestResponseUtils.extractUserIdFromRequest.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await AssessmentAuthorization.verify(request, hFake, {
          requestResponseUtils,
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        expect(assessmentRepository.getByAssessmentIdAndUserId).to.have.been.calledWith(request.params.id, null);
        expect(response).to.deep.equal(fetchedAssessment);
      });
    });

    describe('When userId (from token) is not linked to assessment', function () {
      it('should take over the request and response with 401 status code', async function () {
        // given
        const extractedUserId = null;
        requestResponseUtils.extractUserIdFromRequest.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.rejects();

        // when
        const response = await AssessmentAuthorization.verify(request, hFake, {
          requestResponseUtils,
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
