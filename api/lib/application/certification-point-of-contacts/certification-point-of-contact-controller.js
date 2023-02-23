const certificationPointOfContactSerializer = require('../../infrastructure/serializers/jsonapi/certification-point-of-contact-serializer');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  async get(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const certificationPointOfContact = await usecases.getCertificationPointOfContact({ userId: authenticatedUserId });
    return certificationPointOfContactSerializer.serialize(certificationPointOfContact);
  },
};
