import { certificationCandidateController } from '../../../../../src/certification/enrolment/application/certification-candidate-controller.js';
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
