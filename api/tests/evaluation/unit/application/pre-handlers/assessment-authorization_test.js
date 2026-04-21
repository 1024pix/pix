import sinon from 'sinon';

import { assessmentAuthorization } from '../../../../../src/evaluation/application/pre-handlers/assessment-authorization.js';

import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Pre-handler | Assessment Authorization', function () {
  let assessmentRepository;
  let validationErrorSerializer;

  beforeEach(function () {
    assessmentRepository = {
      getByAssessmentIdAndUserId: sinon.stub(),
    };
    validationErrorSerializer = { serialize: sinon.stub() };
  });

  describe('#verify', function () {
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
        const response = await assessmentAuthorization.verify(request, hFake, {
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
        const response = await assessmentAuthorization.verify(request, hFake, {
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
        const response = await assessmentAuthorization.verify(request, hFake, {
          assessmentRepository,
          validationErrorSerializer,
        });

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
