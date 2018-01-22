const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');

module.exports = {

  saveChallenges(certificationProfile, certificationCourse) {
    const saveChallengePromises = [];
    certificationProfile.forEach((userCompetence) => {
      userCompetence.challenges.forEach((challenge) => {
        saveChallengePromises.push(certificationChallengeRepository.save(challenge, certificationCourse));
      });
    });

    return Promise.all(saveChallengePromises)
      .then((certificationChallenges) => {
        certificationCourse.nbChallenges = certificationChallenges.length;
        return certificationCourse;
      });
  }
};
