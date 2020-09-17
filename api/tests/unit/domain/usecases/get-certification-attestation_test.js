const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getCertificationAttestation = require('../../../../lib/domain/usecases/certificate/get-certification-attestation');

describe('Unit | UseCase | getCertificationAttestation', async () => {

  const userId = 2;
  const certificationId = '23';
  const aAttestationPDF = 'i am a attestation';
  let dependencies;
  let certificate;
  const deliveredAt = new Date('2020-09-17T01:02:03Z');

  beforeEach(() => {
    const cleaCertificationStatus = 'someStatus';
    certificate = domainBuilder.buildPrivateCertificate({
      userId,
      id: certificationId,
      deliveredAt,
    });
    const assessmentResult = domainBuilder.buildAssessmentResult();
    assessmentResult.competenceMarks = [domainBuilder.buildCompetenceMark({ assessmentResultId: assessmentResult.id })];
    const competenceTree = domainBuilder.buildCompetenceTree();
    const resultCompetenceTree = `${certificationId}-${assessmentResult.id}`;
    const fullCertificate = { ...certificate, resultCompetenceTree, cleaCertificationStatus };

    const certificationRepository = {
      getCertificationAttestation: sinon.stub().withArgs(certificationId).resolves(certificate),
    };
    const cleaCertificationStatusRepository = {
      getCleaCertificationStatus: () => sinon.stub().withArgs(certificationId).resolves(cleaCertificationStatus),
    };
    const competenceTreeRepository = { get: sinon.stub().resolves(competenceTree) };
    const assessmentResultRepository = {
      findLatestByCertificationCourseIdWithCompetenceMarks: sinon.stub().withArgs(certificationId).resolves(assessmentResult),
    };

    const certificationAttestationPdf = {
      getCertificationAttestationPdfBuffer: sinon.stub().withArgs({ certificate: fullCertificate }).resolves(aAttestationPDF),
    };

    dependencies = {
      certificationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository,
      certificationAttestationPdf,
    };
  });

  context('when the user is not owner of the certification attestation', async () => {

    it('should throw an error if user is not the owner of the certificate', async () => {
      // given
      const randomOtherUserId = 666;

      // when
      const error = await catchErr(getCertificationAttestation)({ certificationId, userId: randomOtherUserId, ...dependencies });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification attestation', async () => {

    it('should return the attestationPDF', async () => {
      // when
      const { fileName, fileBuffer } = await getCertificationAttestation({ certificationId, userId, ...dependencies });

      // then
      expect(fileBuffer).to.equal(aAttestationPDF);
      expect(fileName).to.equal('attestation-pix-20200917.pdf');
    });
  });
});
