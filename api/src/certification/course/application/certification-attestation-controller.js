import dayjs from 'dayjs';

import { usecases } from '../../course/domain/usecases/index.js';
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

const getCertificationPDFAttestationsForSession = async function (
  request,
  h,
  dependencies = { certificationAttestationPdf },
) {
  const sessionId = request.params.id;
  const isFrenchDomainExtension = request.query.isFrenchDomainExtension;
  const attestations = await usecases.getCertificationAttestationsForSession({
    sessionId,
  });
  const i18n = request.i18n;

  const { buffer } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates: attestations,
    isFrenchDomainExtension,
    i18n,
  });

  const fileName = `attestation-pix-session-${sessionId}.pdf`;
  return h
    .response(buffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const downloadCertificationAttestationsForDivision = async function (
  request,
  h,
  dependencies = { certificationAttestationPdf },
) {
  const organizationId = request.params.id;
  const { i18n } = request;
  const { division, isFrenchDomainExtension } = request.query;

  const attestations = await usecases.findCertificationAttestationsForDivision({
    organizationId,
    division,
  });

  const { buffer } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates: attestations,
    isFrenchDomainExtension,
    i18n,
  });

  const now = dayjs();
  const fileName = `${now.format('YYYYMMDD')}_attestations_${division}.pdf`;

  return h
    .response(buffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const certificationAttestationController = {
  getPDFAttestation,
  getCertificationPDFAttestationsForSession,
  downloadCertificationAttestationsForDivision,
};
export { certificationAttestationController };
