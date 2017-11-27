const CertificationChallenge = require('../../domain/models/data/certification-challenge');

module.exports = {
  save(challenge, certificationCourse) {
    const certificationChallenge = new CertificationChallenge({
      challengeId: challenge.id,
      competenceId: challenge.competence,
      associatedSkill: challenge.testedSkill,
      courseId: certificationCourse.id
    });

    return certificationChallenge.save()
      .then((certificationChallenge) => {
        return certificationChallenge.toJSON();
      });
  }
};
