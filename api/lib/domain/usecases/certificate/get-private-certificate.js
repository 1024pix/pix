const { decorateWithCleaStatusAndCompetenceTree } = require('./decorate-with-clea-status-and-competence-tree');
const { NotFoundError } = require('../../errors');

module.exports = async function getPrivateCertificate({
  certificationId,
  userId,
  certificationRepository,
  privateCertificateRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
  verifyCertificateCodeService,
}) {
  const hasCode = await certificationRepository.hasVerificationCode(certificationId);
  if (!hasCode) {
    const code = await verifyCertificateCodeService.generateCertificateVerificationCode();
    await certificationRepository.saveVerificationCode(certificationId, code);
  }
  const certificate = await privateCertificateRepository.get(certificationId);
  if (certificate.userId !== userId) {
    throw new NotFoundError();
  }

  return decorateWithCleaStatusAndCompetenceTree({
    certificationId,
    toBeDecorated: certificate,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  });
};
