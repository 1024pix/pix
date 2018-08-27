const { expect, sinon, knex } = require('../../../test-helper');

const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');
const CertificationChallengeBookshelf = require('../../../../lib/infrastructure/data/certification-challenge');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');

describe('Unit | Repository | certification-challenge-repository', () => {

  describe('#save', () => {

    const challengeObject = {
      id: 'challenge_id',
      competence: 'competenceId',
      testedSkill: '@skill2'
    };
    const certificationCourseObject = { id: 'certification_course_id' };
    const certificationChallenge = {
      id: 12,
      challengeId: 'challenge_id',
      competenceId: 'competenceId',
      associatedSkill: '@skill2',
      associatedSkillId: 'rec1234',
      courseId: 'certification_course_id'
    };
    const certificationChallengeBookshelf = new CertificationChallengeBookshelf(certificationChallenge);

    beforeEach(() => {
      sinon.stub(CertificationChallengeBookshelf.prototype, 'save').resolves(certificationChallengeBookshelf);
    });

    afterEach(() => {
      CertificationChallengeBookshelf.prototype.save.restore();
    });

    it('should save certification challenge object', () => {
      // when
      const promise = certificationChallengeRepository.save(challengeObject, certificationCourseObject);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationChallengeBookshelf.prototype.save);
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

  describe('#getNonAnsweredChallengeByCourseId', () => {

    const courseId = 'courseId';
    const assessmentId = 'assessmentId';

    const challenge1 = {
      id: 1,
      challengeId: 'recChallenge1',
      courseId,
      associatedSkill: '@brm7',
      competenceId: 'recCompetenceId1'
    };
    const challenge2 = {
      id: 2,
      challengeId: 'recChallenge2',
      courseId,
      associatedSkill: '@twi8',
      competenceId: 'recCompetenceId2'
    };
    const challenge3 = {
      id: 3,
      challengeId: 'recChallenge3',
      courseId,
      associatedSkill: '@twi8',
      competenceId: 'recCompetenceId2'
    };
    const challenge4 = {
      id: 4,
      challengeId: 'recChallenge4',
      courseId: 'otherCourseId',
      associatedSkill: '@twi8',
      competenceId: 'recCompetenceId2'
    };
    const challenges = [
      challenge1,
      challenge2,
      challenge3,
      challenge4
    ];

    const answer1 = {
      id: 1,
      challengeId: 'recChallenge1',
      value: 'Un Pancake',
      assessmentId
    };
    const answers = [answer1];

    beforeEach(() => {
      return knex
        .insert(challenges)
        .into('certification-challenges')
        .then(() => knex('answers').insert(answers));
    });

    afterEach(() => {
      return knex
        .delete()
        .from('certification-challenges')
        .then(() => knex('answers').delete());
    });

    context('no certification challenge', () => {

      it('should reject the promise if no challenge is found', function() {
        // given
        const assessmentId = -1;
        const courseId = -1;

        // when
        const promise = certificationChallengeRepository.getNonAnsweredChallengeByCourseId(
          assessmentId, courseId
        );

        // then
        return expect(promise).to.be.rejectedWith(AssessmentEndedError);
      });

    });

    context('there is some certification challenge(s)', () => {

      it('should return one challenge which has no answer associated', function() {
        // given

        // when
        const promise = certificationChallengeRepository.getNonAnsweredChallengeByCourseId(
          assessmentId, courseId
        );

        // then
        return expect(promise).to.be.fulfilled
          .then((result) => {
            expect(result).to.be.instanceOf(CertificationChallenge);
          });
      });

    });
  });
});
