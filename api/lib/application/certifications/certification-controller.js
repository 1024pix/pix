const usecases = require('../../domain/usecases/index.js');
const events = require('../../domain/events/index.js');
const privateCertificateSerializer = require('../../infrastructure/serializers/jsonapi/private-certificate-serializer.js');
const shareableCertificateSerializer = require('../../infrastructure/serializers/jsonapi/shareable-certificate-serializer.js');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');

const moment = require('moment');

module.exports = {
  async findUserCertifications(request) {
    const userId = request.auth.credentials.userId;

    const privateCertificates = await usecases.findUserPrivateCertificates({ userId });
    return privateCertificateSerializer.serialize(privateCertificates);
  },

  async getCertification(request, h, dependencies = { requestResponseUtils }) {
    const userId = request.auth.credentials.userId;
    const certificationId = request.params.id;
    const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

    const privateCertificate = await usecases.getPrivateCertificate({
      userId,
      certificationId,
      locale,
    });
    return privateCertificateSerializer.serialize(privateCertificate);
  },

  async getCertificationByVerificationCode(request, h, dependencies = { requestResponseUtils }) {
    const verificationCode = request.payload.verificationCode;
    const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

    const shareableCertificate = await usecases.getShareableCertificate({ verificationCode, locale });
    return shareableCertificateSerializer.serialize(shareableCertificate);
  },

  async getPDFAttestation(request, h, dependencies = { certificationAttestationPdf }) {
    const userId = request.auth.credentials.userId;
    const certificationId = request.params.id;
    const isFrenchDomainExtension = request.query.isFrenchDomainExtension;
    const attestation = await usecases.getCertificationAttestation({
      userId,
      certificationId,
    });

    const { buffer } = await dependencies.certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
      certificates: [attestation],
      isFrenchDomainExtension,
    });

    const fileName = `attestation-pix-${moment(attestation.deliveredAt).format('YYYYMMDD')}.pdf`;
    return h
      .response(buffer)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  },

  async neutralizeChallenge(request, h, dependencies = { events }) {
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
  },

  async deneutralizeChallenge(request, h, dependencies = { events }) {
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
  },
};
