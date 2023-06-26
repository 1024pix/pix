import _ from 'lodash';

class CertificationChallenge {
  constructor({
    id,
    associatedSkillName,
    associatedSkillId,
    challengeId,
    courseId,
    competenceId,
    isNeutralized,
    certifiableBadgeKey,
  } = {}) {
    this.id = id;
    this.associatedSkillName = associatedSkillName;
    this.associatedSkillId = associatedSkillId;
    this.challengeId = challengeId;
    this.competenceId = competenceId;
    this.courseId = courseId;
    this.isNeutralized = isNeutralized;
    this.certifiableBadgeKey = certifiableBadgeKey;
  }

  static from({ challenge, certificationCourseId, isNeutralized, certifiableBadgeKey }) {
    return new CertificationChallenge({
      associatedSkillName: challenge.associatedSkillName ?? challenge.skill.name,
      associatedSkillId: challenge.associatedSkillId ?? challenge.skill.id,
      challengeId: challenge.id,
      courseId: certificationCourseId,
      competenceId: challenge.competenceId,
      isNeutralized: _.isUndefined(isNeutralized) ? challenge.isNeutralized : isNeutralized,
      certifiableBadgeKey: _.isUndefined(certifiableBadgeKey) ? challenge.certifiableBadgeKey : certifiableBadgeKey,
    });
  }

  static createForPixCertification({ associatedSkillName, associatedSkillId, challengeId, competenceId }) {
    return new CertificationChallenge({
      id: undefined,
      courseId: undefined,
      associatedSkillName,
      associatedSkillId,
      challengeId,
      competenceId,
      isNeutralized: false,
      certifiableBadgeKey: null,
    });
  }

  static createForPixPlusCertification({
    associatedSkillName,
    associatedSkillId,
    challengeId,
    competenceId,
    certifiableBadgeKey,
  }) {
    return new CertificationChallenge({
      id: undefined,
      courseId: undefined,
      associatedSkillName,
      associatedSkillId,
      challengeId,
      competenceId,
      isNeutralized: false,
      certifiableBadgeKey,
    });
  }
}

export { CertificationChallenge };
