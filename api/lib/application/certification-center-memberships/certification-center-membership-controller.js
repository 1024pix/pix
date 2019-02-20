const usecases = require('../../domain/usecases');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  create(request, h) {
    const userId = request.payload.data.attributes['user-id'];
    const certificationCenterId = request.payload.data.attributes['certification-center-id'];
    return usecases.createCertificationCenterMembership({ userId, certificationCenterId })
      .then((membership) => h.response(membership).created())
      .catch((error) => errorManager.send(h, error));
  },
};
