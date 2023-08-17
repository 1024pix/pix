import { usecases } from '../../domain/usecases/index.js';
import * as certificationPointOfContactSerializer from '../../infrastructure/serializers/jsonapi/certification-point-of-contact-serializer.js';

const get = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;
  const certificationPointOfContact = await usecases.getCertificationPointOfContact({ userId: authenticatedUserId });
  return certificationPointOfContactSerializer.serialize(certificationPointOfContact);
};

const certificationPointOfContactController = { get };
export { certificationPointOfContactController };
