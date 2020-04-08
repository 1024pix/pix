const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');

module.exports = {

  saveChallenges(userCompetences, certificationCourse) {
    const saveCertificationChallengePromises = [];
    userCompetences.forEach((userCompetence) => {
      userCompetence.challenges.forEach((challenge) => {
        saveCertificationChallengePromises.push(certificationChallengeRepository.save(challenge, certificationCourse));
      });
    });

    return Promise.all(saveCertificationChallengePromises)
      .then((certificationChallenges) => {
        certificationCourse.certificationChallenges = certificationChallenges;
        return certificationCourse;
      });
  }
};
