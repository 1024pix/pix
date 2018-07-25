const Assessment = require('../models/Assessment');

module.exports = function findCompletedUserCertifications({ userId, certificationRepository }) {
  return certificationRepository.findCertificationsByUserId(userId)
    .then((certifications) => {
      return certifications.filter((certification) => certification.assessmentState === Assessment.states.COMPLETED);
    });
};
