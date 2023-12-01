import { expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { certificationOfficerController } from '../../../../../src/certification/session/application/certification-officer-controller.js';

describe('Unit | Controller | certification-officer-controller', function () {
  describe('#assignCertificationOfficer', function () {
    it('should return updated session', async function () {
      // given
      const sessionId = 1;
      const userId = 274939274;
      const session = Symbol('session');
      const sessionJsonApi = Symbol('someSessionSerialized');
      const request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
      };
      sinon
        .stub(usecases, 'assignCertificationOfficerToJurySession')
        .withArgs({
          sessionId,
          certificationOfficerId: userId,
        })
        .resolves(session);
      const jurySessionSerializer = { serialize: sinon.stub() };
      jurySessionSerializer.serialize.withArgs(session).returns(sessionJsonApi);

      // when
      const response = await certificationOfficerController.assignCertificationOfficer(request, hFake, {
        jurySessionSerializer,
      });

      // then
      expect(usecases.assignCertificationOfficerToJurySession).to.have.been.calledWithExactly({
        sessionId,
        certificationOfficerId: userId,
      });
      expect(response).to.deep.equal(sessionJsonApi);
    });
  });
});
