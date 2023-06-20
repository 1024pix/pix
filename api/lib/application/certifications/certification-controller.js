import { usecases } from '../../domain/usecases/index.js';
import * as events from '../../domain/events/index.js';
import * as privateCertificateSerializer from '../../infrastructure/serializers/jsonapi/private-certificate-serializer.js';
import * as shareableCertificateSerializer from '../../infrastructure/serializers/jsonapi/shareable-certificate-serializer.js';
import * as certificationAttestationPdf from '../../infrastructure/utils/pdf/certification-attestation-pdf.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';

const findUserCertifications = async function (request) {
  const userId = request.auth.credentials.userId;

  const privateCertificates = await usecases.findUserPrivateCertificates({ userId });
  return privateCertificateSerializer.serialize(privateCertificates);
};

const getCertification = async function (request, h, dependencies = { requestResponseUtils }) {
  const userId = request.auth.credentials.userId;
  const certificationId = request.params.id;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const privateCertificate = await usecases.getPrivateCertificate({
    userId,
    certificationId,
    locale,
  });
  return privateCertificateSerializer.serialize(privateCertificate);
};

const getCertificationByVerificationCode = async function (request, h, dependencies = { requestResponseUtils }) {
  const verificationCode = request.payload.verificationCode;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const shareableCertificate = await usecases.getShareableCertificate({ verificationCode, locale });
  return shareableCertificateSerializer.serialize(shareableCertificate);
};

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

const neutralizeChallenge = async function (request, h, dependencies = { events }) {
  const challengeRecId = request.payload.data.attributes.challengeRecId;
  const certificationCourseId = request.payload.data.attributes.certificationCourseId;
  const juryId = request.auth.credentials.userId;
  const event = await usecases.neutralizeChallenge({
    challengeRecId,
    certificationCourseId,
    juryId,
  });
  await dependencies.events.eventDispatcher.dispatch(event);
  return h.response().code(204);
};

const deneutralizeChallenge = async function (request, h, dependencies = { events }) {
  const challengeRecId = request.payload.data.attributes.challengeRecId;
  const certificationCourseId = request.payload.data.attributes.certificationCourseId;
  const juryId = request.auth.credentials.userId;
  const event = await usecases.deneutralizeChallenge({
    challengeRecId,
    certificationCourseId,
    juryId,
  });
  await dependencies.events.eventDispatcher.dispatch(event);
  return h.response().code(204);
};

const certificationController = {
  findUserCertifications,
  getCertification,
  getCertificationByVerificationCode,
  getPDFAttestation,
  neutralizeChallenge,
  deneutralizeChallenge,
};

export { certificationController };
