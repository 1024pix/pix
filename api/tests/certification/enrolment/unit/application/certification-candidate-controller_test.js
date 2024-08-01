import { certificationCandidateController } from '../../../../../src/certification/enrolment/application/certification-candidate-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | certification-candidate-controller', function () {
  describe('#addCandidate', function () {
    it('should return the added certification candidate id', async function () {
      // given
      const sessionId = 1;
      const certificationCandidate = 'candidate';
      const addedCertificationCandidateId = 2;
      const request = {
        params: { id: sessionId },
        payload: {
          data: {
            attributes: {
              'complementary-certification': null,
            },
          },
        },
      };
      sinon.stub(usecases, 'addCertificationCandidateToSession');
      usecases.addCertificationCandidateToSession
        .withArgs({
          sessionId,
          certificationCandidate,
          subscription: null,
        })
        .resolves(addedCertificationCandidateId);
      const certificationCandidateSerializer = {
        deserialize: sinon.stub(),
      };
      certificationCandidateSerializer.deserialize.resolves(certificationCandidate);

      // when
      const response = await certificationCandidateController.addCandidate(request, hFake, {
        certificationCandidateSerializer,
      });

      // then
      expect(response.source).to.deep.equal({
        data: {
          id: `${addedCertificationCandidateId}`,
          type: 'certification-candidates',
        },
      });
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#validateCertificationInstructions', function () {
    it('should return the updated certification candidate', async function () {
      // given
      const certificationCandidatesJsonApi = 'candidatesJSONAPI';
      const certificationCandidate = 'candidate';
      const certificationCandidateId = 2;
      const request = {
        params: { certificationCandidateId },
      };
      sinon.stub(usecases, 'candidateHasSeenCertificationInstructions');
      const certificationCandidateSerializer = {
        serializeForApp: sinon.stub(),
      };
      certificationCandidateSerializer.serializeForApp.returns(certificationCandidatesJsonApi);
      const updatedCertificationCandidate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate();
      usecases.candidateHasSeenCertificationInstructions
        .withArgs({
          certificationCandidate,
        })
        .resolves(updatedCertificationCandidate);

      // when
      const response = await certificationCandidateController.validateCertificationInstructions(request, hFake, {
        certificationCandidateSerializer,
      });

      // then
      expect(response).to.deep.equal(certificationCandidatesJsonApi);
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
      expect(response).to.be.null;
    });
  });
});
