import { expect, hFake, sinon } from '../../../../test-helper.js';
import { certificationCandidateController } from '../../../../../src/certification/session/application/certification-candidate-controller.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { usecases as usecasesLib } from '../../../../../lib/domain/usecases/index.js';

describe('Unit | Controller | certification-candidate-controller', function () {
  describe('#add', function () {
    it('should return the added certification candidate', async function () {
      // given
      const sessionId = 1;
      const certificationCandidate = 'candidate';
      const addedCertificationCandidate = 'addedCandidate';
      const certificationCandidateJsonApi = 'addedCandidateJSONApi';
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
          complementaryCertification: null,
        })
        .resolves(addedCertificationCandidate);
      const certificationCandidateSerializer = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };
      certificationCandidateSerializer.serialize
        .withArgs(addedCertificationCandidate)
        .returns(certificationCandidateJsonApi);
      certificationCandidateSerializer.deserialize.resolves(certificationCandidate);

      // when
      const response = await certificationCandidateController.add(request, hFake, {
        certificationCandidateSerializer,
      });

      // then
      expect(response.source).to.equal(certificationCandidateJsonApi);
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#getCertificationCandidates', function () {
    let request;
    const sessionId = 1;
    const certificationCandidates = 'candidates';
    const certificationCandidatesJsonApi = 'candidatesJSONAPI';

    beforeEach(function () {
      // given
      request = {
        params: { id: sessionId },
      };
      sinon
        .stub(usecasesLib, 'getSessionCertificationCandidates')
        .withArgs({ sessionId })
        .resolves(certificationCandidates);
    });

    it('should return certification candidates', async function () {
      // when
      const certificationCandidateSerializer = { serialize: sinon.stub() };
      certificationCandidateSerializer.serialize
        .withArgs(certificationCandidates)
        .returns(certificationCandidatesJsonApi);
      const response = await certificationCandidateController.getCertificationCandidates(request, hFake, {
        certificationCandidateSerializer,
      });

      // then
      expect(response).to.deep.equal(certificationCandidatesJsonApi);
    });
  });
});
