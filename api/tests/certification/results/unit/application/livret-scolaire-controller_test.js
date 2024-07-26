import { livretScolaireController } from '../../../../../src/certification/results/application/livret-scolaire-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Results | Unit | Application | certifications-controller', function () {
  describe('#getCertificationsByOrganizationUAI', function () {
    it('should return a serialized shareable certifications results for Livret Scolaire given by the UAI', async function () {
      // given
      const request = { params: { uai: 'uai' } };
      const certifications = Symbol('certifications');
      sinon.stub(usecases, 'getCertificationsResultsForLivretScolaire');
      usecases.getCertificationsResultsForLivretScolaire.withArgs({ uai: 'uai' }).resolves(certifications);

      const dependencies = {
        certificationsResultsForLivretScolaireSerializer: {
          serialize: sinon.stub(),
        },
      };
      const serializedCertifications = Symbol('serializedCertifications');
      dependencies.certificationsResultsForLivretScolaireSerializer.serialize
        .withArgs(certifications)
        .returns(serializedCertifications);

      // when
      const response = await livretScolaireController.getCertificationsByOrganizationUAI(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal(serializedCertifications);
    });
  });
});
