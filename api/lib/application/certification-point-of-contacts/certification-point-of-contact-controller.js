import certificationPointOfContactSerializer from '../../infrastructure/serializers/jsonapi/certification-point-of-contact-serializer';
import usecases from '../../domain/usecases';

export default {
  async get(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const certificationPointOfContact = await usecases.getCertificationPointOfContact({ userId: authenticatedUserId });
    return certificationPointOfContactSerializer.serialize(certificationPointOfContact);
  },
};
