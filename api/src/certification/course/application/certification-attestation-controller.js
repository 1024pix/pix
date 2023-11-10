import { usecases } from '../../shared/domain/usecases/index.js';
import * as certificationAttestationPdf from '../infrastructure/utils/pdf/certification-attestation-pdf.js';

const getPDFAttestation = async function (request, h, dependencies = { certificationAttestationPdf }) {
  const userId = request.auth.credentials.userId;
  const certificationId = request.params.id;
  const { i18n } = request;
  const { isFrenchDomainExtension } = request.query;

  const attestation = await usecases.getCertificationAttestation({
    userId,
    certificationId,
  });

  const { buffer, fileName } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates: [attestation],
    isFrenchDomainExtension,
    i18n,
  });

  return h
    .response(buffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const certificationAttestationController = {
  getPDFAttestation,
};
export { certificationAttestationController };
