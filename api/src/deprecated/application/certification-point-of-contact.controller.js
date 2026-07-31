import { usecases } from '../domain/usecases/index.js';
import { certificationPointOfContactSerializer } from '../infrastructure/serializers/jsonapi/certification-point-of-contact.serializer.js';

const getCertificationPointOfContact = async function (request) {
  const authenticatedUserId = request.auth.credentials.userId;
  const certificationPointOfContact = await usecases.getCertificationPointOfContact({ userId: authenticatedUserId });
  return certificationPointOfContactSerializer.serialize(certificationPointOfContact);
};

export const certificationPointOfContactController = { getCertificationPointOfContact };
