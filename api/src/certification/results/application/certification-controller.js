import * as privateCertificateSerializer from '../../../../lib/infrastructure/serializers/jsonapi/private-certificate-serializer.js';
import { usecases } from '../domain/usecases/index.js';

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
