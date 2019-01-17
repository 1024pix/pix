const usecases = require('../../domain/usecases');
const controllerReplies = require('../../infrastructure/controller-replies');

module.exports = {

  create(request, h) {
    const userId = request.payload.data.attributes['user-id'];
    const certificationCenterId = request.payload.data.attributes['certification-center-id'];
    return usecases.createCertificationCenterMembership({ userId, certificationCenterId })
      .then(controllerReplies(h).created)
      .catch((error) => {
        return controllerReplies(h).error(error);
      });
  },
};
