const usecases = require('../../domain/usecases');
const events = require('../../domain/events');
const { PassThrough } = require('stream');
const privateCertificateSerializer = require('../../infrastructure/serializers/jsonapi/private-certificate-serializer');
const shareableCertificateSerializer = require('../../infrastructure/serializers/jsonapi/shareable-certificate-serializer');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf');
const cpfCertificationXmlExportService = require('../../domain/services/cpf-certification-xml-export-service');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');

const moment = require('moment');

module.exports = {
  async findUserCertifications(request) {
    const userId = request.auth.credentials.userId;

    const privateCertificates = await usecases.findUserPrivateCertificates({ userId });
    return privateCertificateSerializer.serialize(privateCertificates);
  },

  async getCertification(request) {
    const userId = request.auth.credentials.userId;
    const certificationId = request.params.id;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    const privateCertificate = await usecases.getPrivateCertificate({
      userId,
      certificationId,
      locale,
    });
    return privateCertificateSerializer.serialize(privateCertificate);
  },

  async getCertificationByVerificationCode(request) {
    const verificationCode = request.payload.verificationCode;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    const shareableCertificate = await usecases.getShareableCertificate({ verificationCode, locale });
    return shareableCertificateSerializer.serialize(shareableCertificate);
  },

  async getPDFAttestation(request, h) {
    const userId = request.auth.credentials.userId;
    const certificationId = request.params.id;
    const isFrenchDomainExtension = request.query.isFrenchDomainExtension;
    const attestation = await usecases.getCertificationAttestation({
      userId,
      certificationId,
    });

    const { buffer } = await certificationAttestationPdf.getCertificationAttestationsPdfBuffer({
      certificates: [attestation],
      isFrenchDomainExtension,
    });

    const fileName = `attestation-pix-${moment(attestation.deliveredAt).format('YYYYMMDD')}.pdf`;
    return h
      .response(buffer)
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .header('Content-Type', 'application/pdf');
  },

  async neutralizeChallenge(request, h) {
    const challengeRecId = request.payload.data.attributes.challengeRecId;
    const certificationCourseId = request.payload.data.attributes.certificationCourseId;
    const juryId = request.auth.credentials.userId;
    const event = await usecases.neutralizeChallenge({
      challengeRecId,
      certificationCourseId,
      juryId,
    });
    await events.eventDispatcher.dispatch(event);
    return h.response().code(204);
  },

  async deneutralizeChallenge(request, h) {
    const challengeRecId = request.payload.data.attributes.challengeRecId;
    const certificationCourseId = request.payload.data.attributes.certificationCourseId;
    const juryId = request.auth.credentials.userId;
    const event = await usecases.deneutralizeChallenge({
      challengeRecId,
      certificationCourseId,
      juryId,
    });
    await events.eventDispatcher.dispatch(event);
    return h.response().code(204);
  },

  async getCpfExport(request) {
    const { startDate, endDate } = request.query;

    const cpfCertificationResults = await usecases.getCpfCertificationResults({ startDate, endDate });

    const writableStream = new PassThrough();
    cpfCertificationXmlExportService.getXmlExport({ cpfCertificationResults, writableStream });

    const filename = `pix-cpf-export-from-${startDate}-to-${endDate}.xml`;
    writableStream.headers = {
      'content-type': 'text/xml;charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,

      // WHY: to avoid compression because when compressing, the server buffers
      // for too long causing a response timeout.
      'content-encoding': 'identity',
    };

    return writableStream;
  },
};
