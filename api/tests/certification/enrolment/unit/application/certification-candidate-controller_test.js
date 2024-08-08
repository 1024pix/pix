import { certificationCandidateController } from '../../../../../src/certification/enrolment/application/certification-candidate-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import * as enrolledCandidateRepository from '../../../../../src/certification/enrolment/infrastructure/repositories/enrolled-candidate-repository.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | certification-candidate-controller', function () {
  describe('#addCandidate', function () {
    it('should return the added certification candidate id', async function () {
      // given
      const sessionId = 1;
      const candidate = 'candidate';
      const addedCandidateId = 2;
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

  describe('#validateCertificationInstructions', function () {
    it.skip('should return the updated certification candidate', async function () {
      const certificationCandidatesJsonApi = 'candidatesJSONAPI';
      const certificationCandidate = 'candidate';
      const certificationCandidateId = 2;
      const request = {
        params: { certificationCandidateId },
      };
      sinon.stub(usecases, 'candidateHasSeenCertificationInstructions');
      const enrolledCandidate = Symbol('updatedEnrolledCandidate');
      const certificationCandidateSerializer = {
        serialize: sinon.stub(),
      };
      // je peux pas stub ça ! T_T
      // 'TypeError: ES Modules cannot be stubbed'
      const enrolledCandidateGetStub = sinon.stub(enrolledCandidateRepository, 'get');
      enrolledCandidateGetStub.withArgs(certificationCandidateId).resolves(enrolledCandidate);
      certificationCandidateSerializer.serialize.withArgs(enrolledCandidate).returns(certificationCandidatesJsonApi);
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
      expect(response.statusCode).to.equal(204);
    });
  });
});
