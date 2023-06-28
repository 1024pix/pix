import { expect, sinon, hFake } from '../../../../tests/test-helper.js';
import { usecases } from '../../../shared/domain/usecases/index.js';
import { sessionController } from '../../../certification/application/session/session-controller.js';

describe('Unit | Controller | sessionController', function () {
  describe('#addCertificationCandidate ', function () {
    let request;
    const sessionId = 1;
    const certificationCandidate = 'candidate';
    const addedCertificationCandidate = 'addedCandidate';
    const certificationCandidateJsonApi = 'addedCandidateJSONApi';
    let complementaryCertification;

    beforeEach(function () {
      // given
      complementaryCertification = Symbol('complementaryCertification');
      request = {
        params: { id: sessionId },
        payload: {
          data: {
            attributes: {
              'complementary-certification': complementaryCertification,
            },
          },
        },
      };
      sinon
        .stub(usecases, 'addCertificationCandidateToSession')
        .withArgs({
          sessionId,
          certificationCandidate,
          complementaryCertification,
        })
        .resolves(addedCertificationCandidate);
    });

    it('should return the added certification candidate', async function () {
      // given
      const certificationCandidateSerializer = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };
      certificationCandidateSerializer.serialize
        .withArgs(addedCertificationCandidate)
        .returns(certificationCandidateJsonApi);
      certificationCandidateSerializer.deserialize.resolves(certificationCandidate);

      // when
      const response = await sessionController.addCertificationCandidate(request, hFake, {
        certificationCandidateSerializer,
      });

      // then
      expect(response.source).to.equal(certificationCandidateJsonApi);
      expect(response.statusCode).to.equal(201);
    });
  });
});
