import { expect, sinon, domainBuilder, hFake } from '../../../../test-helper.js';
import { certificationAttestationController } from '../../../../../src/certification/course/application/certification-attestation-controller.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { LANG } from '../../../../../src/shared/domain/constants.js';
const { FRENCH } = LANG;
describe('Unit | Controller | certification-attestation-controller', function () {
  describe('#getPDFAttestation', function () {
    it('should return attestation in PDF binary format', async function () {
      // given
      const certification = domainBuilder.buildPrivateCertificateWithCompetenceTree();
      const attestationPDF = 'binary string';
      const fileName = 'attestation-pix-20181003.pdf';
      const userId = 1;
      const i18n = Symbol('i18n');

      const request = {
        i18n,
        auth: { credentials: { userId } },
        params: { id: certification.id },
        query: { isFrenchDomainExtension: true, lang: FRENCH },
      };

      sinon
        .stub(usecases, 'getCertificationAttestation')
        .withArgs({
          userId,
          certificationId: certification.id,
        })
        .resolves(certification);
      const certificationAttestationPdfStub = {
        getCertificationAttestationsPdfBuffer: sinon.stub(),
      };
      certificationAttestationPdfStub.getCertificationAttestationsPdfBuffer
        .withArgs({ certificates: [certification], isFrenchDomainExtension: true, i18n })
        .resolves({ buffer: attestationPDF, fileName });

      // when
      const response = await certificationAttestationController.getPDFAttestation(request, hFake, {
        certificationAttestationPdf: certificationAttestationPdfStub,
      });

      // then
      expect(response.source).to.deep.equal(attestationPDF);
      expect(response.headers['Content-Disposition']).to.contains('attachment; filename=attestation-pix-20181003.pdf');
    });
  });
});
