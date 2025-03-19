import dayjs from 'dayjs';

import { V3CertificationAttestation } from '../domain/models/V3CertificationAttestation.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationAttestationPdf from '../infrastructure/utils/pdf/certification-attestation-pdf.js';
import * as v3CertificationAttestationPdf from '../infrastructure/utils/pdf/v3-certification-attestation-pdf.js';

const getPDFAttestation = async function (
  request,
  h,
  dependencies = { certificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;
  const { i18n } = request;
  const { isFrenchDomainExtension } = request.query;

  const attestation = await usecases.getCertificationAttestation({
    userId,
    certificationCourseId,
  });

  if (attestation instanceof V3CertificationAttestation) {
    const fileName = i18n.__('certification-confirmation.file-name', {
      deliveredAt: dayjs(attestation.deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        dependencies.v3CertificationAttestationPdf.generate({
          certificates: [attestation],
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  }

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
  const sessionId = request.params.sessionId;
  const isFrenchDomainExtension = request.query.isFrenchDomainExtension;
  const attestations = await usecases.getCertificationAttestationsForSession({
    sessionId,
  });

  if (attestations.every((attestation) => attestation instanceof V3CertificationAttestation)) {
    return h.response().code(200);
  }

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
  const organizationId = request.params.organizationId;
  const { i18n } = request;
  const { division, isFrenchDomainExtension } = request.query;

  const attestations = await usecases.findCertificationAttestationsForDivision({
    organizationId,
    division,
  });

  if (attestations.every((attestation) => attestation instanceof V3CertificationAttestation)) {
    return h.response().code(200);
  }

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
