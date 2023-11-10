import { expect, sinon, domainBuilder, hFake } from '../../../../test-helper.js';
import { certificationAttestationController } from '../../../../../src/certification/course/application/certification-attestation-controller.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { LANG } from '../../../../../src/shared/domain/constants.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';
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

  describe('#getCertificationPDFAttestationsForSession', function () {
    it('should return an attestation in PDF binary format', async function () {
      // given
      const certificationAttestationPdf = {
        getCertificationAttestationsPdfBuffer: sinon.stub(),
      };
      const session = domainBuilder.buildSession.finalized({ id: 12 });
      domainBuilder.buildCertificationCourse({
        id: 1,
        sessionId: 12,
        userId: 1,
        completedAt: '2020-01-01',
      });
      domainBuilder.buildCertificationCourse({
        id: 2,
        sessionId: 12,
        userId: 2,
        completedAt: '2020-01-01',
      });
      domainBuilder.buildCertificationCourse({
        id: 3,
        sessionId: 12,
        userId: 3,
        completedAt: '2020-01-01',
      });
      const certification1 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 1 });
      const certification2 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 2 });
      const certification3 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 3 });
      const attestationPDF = 'binary string';
      const userId = 1;
      const i18n = getI18n();

      const request = {
        auth: { credentials: { userId } },
        params: { id: session.id },
        query: { isFrenchDomainExtension: true },
        i18n,
      };

      sinon
        .stub(usecases, 'getCertificationAttestationsForSession')
        .withArgs({
          sessionId: session.id,
        })
        .resolves([certification1, certification2, certification3]);

      certificationAttestationPdf.getCertificationAttestationsPdfBuffer
        .withArgs({
          certificates: [certification1, certification2, certification3],
          isFrenchDomainExtension: true,
          i18n,
        })
        .resolves({ buffer: attestationPDF });

      // when
      const response = await certificationAttestationController.getCertificationPDFAttestationsForSession(
        request,
        hFake,
        {
          certificationAttestationPdf,
      });

      // then
      expect(response.source).to.deep.equal(attestationPDF);
      expect(response.headers['Content-Disposition']).to.contains(
        'attachment; filename=attestation-pix-session-12.pdf',
      );
    });
  });
});
