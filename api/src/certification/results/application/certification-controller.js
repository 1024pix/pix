import * as requestResponseUtils from '../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as privateCertificateSerializer from '../infrastructure/serializers/private-certificate-serializer.js';
import * as shareableCertificateSerializer from '../infrastructure/serializers/shareable-certificate-serializer.js';

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

const certificationController = {
  getCertification,
  findUserCertifications,
  getCertificationByVerificationCode,
};

export { certificationController };
