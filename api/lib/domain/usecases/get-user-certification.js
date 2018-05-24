const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = function({ certificationId, certificationRepository, userId }) {
  return certificationRepository.getCertification({ id: certificationId })
    .then((certification) => {
      if (certification.userId !== parseInt(userId, 10)) {
        throw new UserNotAuthorizedToAccessEntity();
      }

      return certification;
    });
};
