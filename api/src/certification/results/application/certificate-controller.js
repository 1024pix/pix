import dayjs from 'dayjs';

import { config } from '../../../shared/config.js';
import { addCorrelationInfos } from '../../../shared/infrastructure/execution-context-manager.js';
import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import { generateHash } from '../../../shared/infrastructure/utils/crypto.js';
import { SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { normalizeAndRemoveAccents } from '../../../shared/infrastructure/utils/string-utils.js';
import { Certificate } from '../domain/models/v3/Certificate.js';
import { CERTIFICATE_LABEL_CONTEXTS } from '../domain/models/v3/CertificateMeshLevel.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificateSerializer from '../infrastructure/serializers/certificate-serializer.js';
import * as certificateSummarySerializer from '../infrastructure/serializers/certificate-summary-serializer.js';
import * as privateCertificateSerializer from '../infrastructure/serializers/private-certificate-serializer.js';
import * as v2CertificationAttestationPdf from '../infrastructure/utils/pdf/generate-v2-pdf-attestation.js';
import * as v3CertificationAttestationPdf from '../infrastructure/utils/pdf/generate-v3-pdf-certificate.js';

async function getCertificateByVerificationCode(request, h, dependencies = { certificateSerializer }) {
  const locale = getChallengeLocale(request);
  const i18n = getI18nFromRequest(request);

  let certificate;
  const verificationCode = request.payload.verificationCode;
  addCorrelationInfos({
    hashedVerificationCode: generateHash(verificationCode, {
      salt: config.logging.certificationVerificationCodeLogHashSecret,
    }),
    scope: SCOPES.CERTIFICATION,
  });

  const certificationCourse = await usecases.getCertificationCourseByVerificationCode({ verificationCode });

  if (certificationCourse.isV3()) {
    certificate = await usecases.getCertificate({
      certificationCourseId: certificationCourse.getId(),
      locale,
    });
  } else {
    certificate = await usecases.getShareableCertificate({
      certificationCourseId: certificationCourse.getId(),
      locale,
    });
  }
  return dependencies.certificateSerializer.serialize({
    certificate,
    translate: i18n.__,
    context: CERTIFICATE_LABEL_CONTEXTS.SHAREABLE,
  });
}

async function getCertificate(request, h, dependencies = { certificateSerializer, privateCertificateSerializer }) {
  const locale = getChallengeLocale(request);
  const i18n = getI18nFromRequest(request);

  const certificationCourseId = request.params.certificationCourseId;

  const certificationCourseVersion = await usecases.getCertificationCourseVersion({ certificationCourseId });

  let certificate;
  if (certificationCourseVersion.isV3()) {
    certificate = await usecases.getCertificate({
      certificationCourseId,
      locale,
    });
    return dependencies.certificateSerializer.serialize({
      certificate,
      translate: i18n.__,
      context: CERTIFICATE_LABEL_CONTEXTS.USER,
    });
  } else {
    certificate = await usecases.getPrivateCertificate({
      certificationCourseId,
      locale,
    });
    return dependencies.privateCertificateSerializer.serialize(certificate, { translate: i18n.__ });
  }
}

async function findUserCertificateSummaries(request) {
  const i18n = getI18nFromRequest(request);
  const userId = request.auth.credentials.userId;

  const certificateSummaries = await usecases.findUserCertificateSummaries({ userId });
  return certificateSummarySerializer.serialize(certificateSummaries, { translate: i18n.__ });
}

async function getPDFCertificate(
  request,
  h,
  dependencies = { v2CertificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const certificationCourseId = request.params.certificationCourseId;
  const { isFrenchDomainExtension } = request.query;
  const i18n = getI18nFromRequest(request);

  const certificate = await usecases.getCertificate({ certificationCourseId, locale: i18n.getLocale() });

  const fileName = i18n.__('certification.certificate.file-name', {
    deliveredAt: dayjs(certificate.deliveredAt).format('YYYYMMDD'),
  });

  if (certificate instanceof Certificate) {
    return h
      .response(
        await dependencies.v3CertificationAttestationPdf.generate({
          certificates: [certificate],
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  }

  return h
    .response(
      dependencies.v2CertificationAttestationPdf.generate({
        certificates: [certificate],
        i18n,
        isFrenchDomainExtension,
      }),
    )
    .code(200)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
}

async function getSessionCertificates(
  request,
  h,
  dependencies = { v2CertificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const i18n = getI18nFromRequest(request);

  const sessionId = request.params.sessionId;
  const isFrenchDomainExtension = request.query.isFrenchDomainExtension;
  const certificates = await usecases.getCertificatesForSession({
    sessionId,
  });

  const translatedFileName = i18n.__('certification.certificate.file-name', {
    deliveredAt: dayjs(certificates[0].deliveredAt).format('YYYYMMDD'),
  });

  if (certificates.every((certificate) => certificate instanceof Certificate)) {
    return h
      .response(
        await dependencies.v3CertificationAttestationPdf.generate({
          certificates,
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=session-${sessionId}-${translatedFileName}`)
      .header('Content-Type', 'application/pdf');
  }

  return h
    .response(
      dependencies.v2CertificationAttestationPdf.generate({
        certificates,
        i18n,
        isFrenchDomainExtension,
      }),
    )
    .header('Content-Disposition', `attachment; filename=session-${sessionId}-${translatedFileName}`)
    .header('Content-Type', 'application/pdf');
}

async function downloadDivisionCertificates(
  request,
  h,
  dependencies = { v2CertificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const i18n = getI18nFromRequest(request);

  const organizationId = request.params.organizationId;
  const { division, isFrenchDomainExtension } = request.query;

  const certificates = await usecases.findCertificatesForDivision({
    organizationId,
    division,
    locale: i18n.getLocale(),
  });

  if (certificates.some((certificate) => certificate instanceof Certificate)) {
    const v3Certificates = certificates.filter((certificate) => certificate instanceof Certificate);
    const normalizedDivision = normalizeAndRemoveAccents(division);

    const translatedFileName = i18n.__('certification.certificate.file-name', {
      deliveredAt: dayjs(certificates[0].deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        await dependencies.v3CertificationAttestationPdf.generate({
          certificates: v3Certificates,
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=${normalizedDivision}-${translatedFileName}`)
      .header('Content-Type', 'application/pdf');
  }

  const now = dayjs();
  const fileName = `${now.format('YYYYMMDD')}_attestations_${division}.pdf`;

  return h
    .response(
      dependencies.v2CertificationAttestationPdf.generate({
        certificates,
        i18n,
        isFrenchDomainExtension,
      }),
    )
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
}

const certificateController = {
  getCertificate,
  getCertificateByVerificationCode,
  getPDFCertificate,
  getSessionCertificates,
  downloadDivisionCertificates,
  findUserCertificateSummaries,
};

export { certificateController };
