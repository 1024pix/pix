import dayjs from 'dayjs';

import { usecases as certificationSharedUsecases } from '../../../../src/certification/shared/domain/usecases/index.js';
import * as requestResponseUtils from '../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { UnauthorizedError } from '../../../shared/application/http-errors.js';
import { normalizeAndRemoveAccents } from '../../../shared/infrastructure/utils/string-utils.js';
import { V3Certificate } from '../domain/models/V3Certificate.js';
import { usecases } from '../domain/usecases/index.js';
import * as privateCertificateSerializer from '../infrastructure/serializers/private-certificate-serializer.js';
import * as shareableCertificateSerializer from '../infrastructure/serializers/shareable-certificate-serializer.js';
import * as certificationAttestationPdf from '../infrastructure/utils/pdf/certification-attestation-pdf.js';
import * as v3CertificationAttestationPdf from '../infrastructure/utils/pdf/v3-certification-attestation-pdf.js';

const getCertificateByVerificationCode = async function (request, h, dependencies = { requestResponseUtils }) {
  const verificationCode = request.payload.verificationCode;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const shareableCertificate = await usecases.getShareableCertificate({ verificationCode, locale });
  return shareableCertificateSerializer.serialize(shareableCertificate);
};

const getCertificate = async function (request, h, dependencies = { requestResponseUtils }) {
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

const findUserCertificates = async function (request) {
  const userId = request.auth.credentials.userId;
  const translate = request.i18n.__;

  const privateCertificates = await usecases.findUserPrivateCertificates({ userId });
  return privateCertificateSerializer.serialize(privateCertificates, { translate });
};

const getPDFCertificate = async function (
  request,
  h,
  dependencies = { certificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const userId = request.auth.credentials.userId;
  const certificationCourseId = request.params.certificationCourseId;
  const { i18n } = request;
  const { isFrenchDomainExtension } = request.query;

  const certificationCourse = await certificationSharedUsecases.getCertificationCourse({ certificationCourseId });

  if (certificationCourse.getUserId() !== userId) {
    throw new UnauthorizedError();
  }

  const certificate = await usecases.getCertificationAttestation({ certificationCourseId });

  if (certificate instanceof V3Certificate) {
    const fileName = i18n.__('certification-confirmation.file-name', {
      deliveredAt: dayjs(certificate.deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        dependencies.v3CertificationAttestationPdf.generate({
          certificates: [certificate],
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  }

  const { buffer, fileName } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates: [certificate],
    isFrenchDomainExtension,
    i18n,
  });

  return h
    .response(buffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const getSessionCertificates = async function (
  request,
  h,
  dependencies = { certificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const { i18n } = request;

  const sessionId = request.params.sessionId;
  const isFrenchDomainExtension = request.query.isFrenchDomainExtension;
  const certificates = await usecases.getCertificationAttestationsForSession({
    sessionId,
  });

  if (certificates.every((certificate) => certificate instanceof V3Certificate)) {
    const translatedFileName = i18n.__('certification-confirmation.file-name', {
      deliveredAt: dayjs(certificates[0].deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        dependencies.v3CertificationAttestationPdf.generate({
          certificates,
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=session-${sessionId}-${translatedFileName}`)
      .header('Content-Type', 'application/pdf');
  }

  const { buffer } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates,
    isFrenchDomainExtension,
    i18n,
  });

  const fileName = `certification-pix-session-${sessionId}.pdf`;
  return h
    .response(buffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const downloadDivisionCertificates = async function (
  request,
  h,
  dependencies = { certificationAttestationPdf, v3CertificationAttestationPdf },
) {
  const organizationId = request.params.organizationId;
  const { i18n } = request;
  const { division, isFrenchDomainExtension } = request.query;

  const certificates = await usecases.findCertificationAttestationsForDivision({
    organizationId,
    division,
  });

  if (certificates.some((certificate) => certificate instanceof V3Certificate)) {
    const v3Certificates = certificates.filter((certificate) => certificate instanceof V3Certificate);
    const normalizedDivision = normalizeAndRemoveAccents(division);

    const translatedFileName = i18n.__('certification-confirmation.file-name', {
      deliveredAt: dayjs(certificates[0].deliveredAt).format('YYYYMMDD'),
    });

    return h
      .response(
        dependencies.v3CertificationAttestationPdf.generate({
          certificates: v3Certificates,
          i18n,
        }),
      )
      .code(200)
      .header('Content-Disposition', `attachment; filename=${normalizedDivision}-${translatedFileName}`)
      .header('Content-Type', 'application/pdf');
  }

  const { buffer } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
    certificates,
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

const certificateController = {
  getCertificate,
  findUserCertificates,
  getCertificateByVerificationCode,
  getPDFCertificate,
  getSessionCertificates,
  downloadDivisionCertificates,
};

export { certificateController };
