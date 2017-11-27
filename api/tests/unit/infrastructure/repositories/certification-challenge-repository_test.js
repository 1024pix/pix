const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');
const CertificationChallenge = require('../../../../lib/domain/models/data/certification-challenge');

describe('Unit | Repository | certification-challenge-repository', () => {

  const challengeObject = {
    id: 'challenge_id',
    competence: 'competenceId',
    testedSkill: '@skill2'
  };
  const certificationCourseObject = { id: 'certification_course_id' };
  const certificationChallenge = {
    challengeId: 'challenge_id',
    competenceId: 'competenceId',
    associatedSkill: '@skill2',
    courseId: 'certification_course_id'
  };
  const certificationChallengeBookshelf = new CertificationChallenge(certificationChallenge);

  beforeEach(() => {
    sinon.stub(CertificationChallenge.prototype, 'save').resolves(certificationChallengeBookshelf);
  });

  afterEach(() => {
    CertificationChallenge.prototype.save.restore();
  });

  it('should save certification challenge object', () => {
    // when
    const promise = certificationChallengeRepository.save(challengeObject, certificationCourseObject);

    // then
    return promise.then(() => {
      sinon.assert.calledOnce(CertificationChallenge.prototype.save);
    });

  });

  it('should return certification challenge object', () => {
    // when
    const promise = certificationChallengeRepository.save(challengeObject, certificationCourseObject);

    // then
    return promise.then((savedCertificationChallenge) => {
      expect(savedCertificationChallenge).to.deep.equal(certificationChallenge);
    });
  });
});
