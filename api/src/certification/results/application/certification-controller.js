import dayjs from 'dayjs';

import * as requestResponseUtils from '../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { normalizeAndRemoveAccents } from '../../../shared/infrastructure/utils/string-utils.js';
import { V3CertificationAttestation } from '../domain/models/V3CertificationAttestation.js';
import { usecases } from '../domain/usecases/index.js';
import * as privateCertificateSerializer from '../infrastructure/serializers/private-certificate-serializer.js';
import * as shareableCertificateSerializer from '../infrastructure/serializers/shareable-certificate-serializer.js';
import * as certificationAttestationPdf from '../infrastructure/utils/pdf/certification-attestation-pdf.js';
import * as v3CertificationAttestationPdf from '../infrastructure/utils/pdf/v3-certification-attestation-pdf.js';

const getCertificationByVerificationCode = async function (request, h, dependencies = { requestResponseUtils }) {
  const verificationCode = request.payload.verificationCode;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const shareableCertificate = await usecases.getShareableCertificate({ verificationCode, locale });
  return shareableCertificateSerializer.serialize(shareableCertificate);
};

const getCertification = async function (request, h, dependencies = { requestResponseUtils }) {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;
  const translate = request.i18n.__;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const privateCertificate = await usecases.getPrivateCertificate({
    userId,
    certificationCourseId,
    locale,
  });
  return privateCertificateSerializer.serialize(privateCertificate, { translate });
};

const findUserCertifications = async function (request) {
  const userId = request.auth.credentials.userId;
  const translate = request.i18n.__;

  const privateCertificates = await usecases.findUserPrivateCertificates({ userId });
  return privateCertificateSerializer.serialize(privateCertificates, { translate });
};

const getPDFAttestation = async function (
  request,
  h,
  dependencies = { certificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;
  const { i18n } = request;
  const { isFrenchDomainExtension } = request.query;

  const certification = await usecases.getCertificationAttestation({
    userId,
    certificationCourseId,
  });

  if (certification instanceof V3CertificationAttestation) {
    const fileName = i18n.__('certification-confirmation.file-name', {
      deliveredAt: dayjs(certification.deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        dependencies.v3CertificationAttestationPdf.generate({
          certificates: [certification],
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  }

  const { buffer, fileName } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates: [certification],
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
  dependencies = { certificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const { i18n } = request;

  const sessionId = request.params.sessionId;
  const isFrenchDomainExtension = request.query.isFrenchDomainExtension;
  const certifications = await usecases.getCertificationAttestationsForSession({
    sessionId,
  });

  if (certifications.every((certification) => certification instanceof V3CertificationAttestation)) {
    const translatedFileName = i18n.__('certification-confirmation.file-name', {
      deliveredAt: dayjs(certifications[0].deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        dependencies.v3CertificationAttestationPdf.generate({
          certificates: certifications,
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=session-${sessionId}-${translatedFileName}`)
      .header('Content-Type', 'application/pdf');
  }

  const { buffer } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates: certifications,
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
  dependencies = { certificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const organizationId = request.params.organizationId;
  const { i18n } = request;
  const { division, isFrenchDomainExtension } = request.query;

  const certifications = await usecases.findCertificationAttestationsForDivision({
    organizationId,
    division,
  });

  if (certifications.every((certification) => certification instanceof V3CertificationAttestation)) {
    const normalizedDivision = normalizeAndRemoveAccents(division);

    const translatedFileName = i18n.__('certification-confirmation.file-name', {
      deliveredAt: dayjs(certifications[0].deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        dependencies.v3CertificationAttestationPdf.generate({
          certificates: certifications,
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=${normalizedDivision}-${translatedFileName}`)
      .header('Content-Type', 'application/pdf');
  }

  const { buffer } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates: certifications,
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

const certificationController = {
  getPDFAttestation,
  getCertificationPDFAttestationsForSession,
  downloadCertificationAttestationsForDivision,
  getCertification,
  findUserCertifications,
  getCertificationByVerificationCode,
};

export { certificationController };
