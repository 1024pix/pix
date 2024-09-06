import { certificationCandidateController } from '../../../../../src/certification/enrolment/application/certification-candidate-controller.js';
import { EditedCandidate } from '../../../../../src/certification/enrolment/domain/models/EditedCandidate.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | certification-candidate-controller', function () {
  describe('#addCandidate', function () {
    it('should return the added certification candidate id', async function () {
      // given
      const sessionId = 1;
      const candidate = 'candidate';
      const addedCandidateId = 2;
      const request = {
        params: { sessionId },
        payload: {
          data: {
            attributes: {
              'complementary-certification': null,
            },
          },
        },
      };
      sinon.stub(usecases, 'addCandidateToSession');
      usecases.addCandidateToSession
        .withArgs({
          sessionId,
          candidate,
          normalizeStringFnc: normalize,
        })
        .resolves(addedCandidateId);
      const candidateSerializer = {
        deserialize: sinon.stub(),
      };
      candidateSerializer.deserialize.resolves(candidate);

      // when
      const response = await certificationCandidateController.addCandidate(request, hFake, {
        candidateSerializer,
      });

      // then
      expect(response.source).to.deep.equal({
        data: {
          id: `${addedCandidateId}`,
          type: 'certification-candidates',
        },
      });
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#deleteCandidate ', function () {
    let request;
    const sessionId = 1;
    const certificationCandidateId = 1;

    beforeEach(function () {
      // given
      request = {
        params: { id: sessionId, certificationCandidateId },
      };
      sinon.stub(usecases, 'deleteUnlinkedCertificationCandidate').withArgs({ certificationCandidateId }).resolves();
    });

    it('should return 204 when deleting successfully the candidate', async function () {
      // when
      const response = await certificationCandidateController.deleteCandidate(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#getEnrolledCandidates', function () {
    it('should return enrolled candidates', async function () {
      // given
      const sessionId = 1;
      const enrolledCandidates = ['enrolledCandidates'];
      const enrolledCandidatesJsonAPI = ['enrolledCandidatesJsonAPI'];
      const request = {
        params: { sessionId },
      };
      sinon.stub(usecases, 'getEnrolledCandidatesInSession');
      usecases.getEnrolledCandidatesInSession
        .withArgs({
          sessionId,
        })
        .resolves(enrolledCandidates);
      const enrolledCandidateSerializer = {
        serialize: sinon.stub(),
      };
      enrolledCandidateSerializer.serialize.resolves(enrolledCandidatesJsonAPI);

      // when
      const response = await certificationCandidateController.getEnrolledCandidates(request, hFake, {
        enrolledCandidateSerializer,
      });

      // then
      expect(response).to.deep.equal(enrolledCandidatesJsonAPI);
    });
  });

  describe('#updateEnrolledCandidate', function () {
    it('should call the usecase with correct data and return 204 NoContent', async function () {
      // given
      sinon.stub(usecases, 'updateEnrolledCandidate');
      usecases.updateEnrolledCandidate.resolves();
      const request = {
        params: {
          certificationCandidateId: 123,
        },
        payload: {
          data: {
            attributes: {
              'accessibility-adjustment-needed': true,
            },
          },
        },
      };

      // when
      const response = await certificationCandidateController.updateEnrolledCandidate(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecases.updateEnrolledCandidate).to.have.been.calledWithExactly({
        editedCandidate: new EditedCandidate({
          id: 123,
          accessibilityAdjustmentNeeded: request.payload.data.attributes['accessibility-adjustment-needed'],
        }),
      });
    });
  });
});
