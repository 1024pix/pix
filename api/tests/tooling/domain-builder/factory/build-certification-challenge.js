import buildSkill from './build-skill';
import CertificationChallenge from '../../../../lib/domain/models/CertificationChallenge';

const buildCertificationChallenge = function ({
  id = 123,
  challengeId = 'recCHAL',
  competenceId = 'recCOMP',
  courseId = 456,
  associatedSkillId = buildSkill().id,
  associatedSkillName = buildSkill().name,
  isNeutralized = false,
  certifiableBadgeKey = null,
} = {}) {
  return new CertificationChallenge({
    id,
    challengeId,
    competenceId,
    courseId,
    associatedSkillId,
    associatedSkillName,
    isNeutralized,
    certifiableBadgeKey,
  });
};

buildCertificationChallenge.forPixCertification = function ({
  challengeId = 'recCHAL',
  competenceId = 'recCOMP',
  associatedSkillId = buildSkill().id,
  associatedSkillName = buildSkill().name,
} = {}) {
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
};

buildCertificationChallenge.forPixPlusCertification = function ({
  challengeId = 'recCHAL',
  competenceId = 'recCOMP',
  associatedSkillId = buildSkill().id,
  associatedSkillName = buildSkill().name,
  certifiableBadgeKey = 'certifiableBadgeKey',
} = {}) {
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
};

export default buildCertificationChallenge;
