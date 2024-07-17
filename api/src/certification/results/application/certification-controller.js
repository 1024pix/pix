import * as requestResponseUtils from '../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as privateCertificateSerializer from '../infrastructure/serializers/private-certificate-serializer.js';

const getCertification = async function (request, h, dependencies = { requestResponseUtils }) {
  const userId = request.auth.credentials.userId;
  const certificationId = request.params.id;
  const translate = request.i18n.__;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const privateCertificate = await usecases.getPrivateCertificate({
    userId,
    certificationId,
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
};

export { certificationController };
