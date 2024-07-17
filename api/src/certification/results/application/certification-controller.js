import { usecases } from '../domain/usecases/index.js';
import * as privateCertificateSerializer from '../infrastructure/serializers/private-certificate-serializer.js';

const findUserCertifications = async function (request) {
  const userId = request.auth.credentials.userId;
  const translate = request.i18n.__;

  const privateCertificates = await usecases.findUserPrivateCertificates({ userId });
  return privateCertificateSerializer.serialize(privateCertificates, { translate });
};

const certificationController = {
  findUserCertifications,
};

export { certificationController };
