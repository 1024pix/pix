const { expect, sinon } = require('../../../test-helper');

const getNextChallengeForCertification = require('../../../../lib/domain/usecases/get-next-challenge-for-certification');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Question = require('../../../../lib/domain/models/Question');

describe('Unit | Domain | Use Cases | get-next-challenge-for-certification', () => {

  describe('#getNextChallengeForCertification', () => {

    let certificationChallengeRepository;
    let challengeRepository;

    beforeEach(() => {
      certificationChallengeRepository = { getNextNonAnsweredChallengeWithIndexByCourseId: sinon.stub().resolves() };
      challengeRepository = { get: sinon.stub().resolves() };
    });

    it('should use the assessmentService to select the next CertificationChallenge', async () => {
      // given
      const nextChallenge = Symbol('nextChallenge');
      const assessment = new Assessment({ id: 156, certificationCourseId: 54516 });

      certificationChallengeRepository.getNextNonAnsweredChallengeWithIndexByCourseId.resolves({ index: 1, challenge: nextChallenge });

      // when
      await getNextChallengeForCertification({ assessment, certificationChallengeRepository, challengeRepository });

      // then
      expect(certificationChallengeRepository.getNextNonAnsweredChallengeWithIndexByCourseId).to.have.been.calledWith(156, 54516);
    });

    it('should return the next Challenge', async () => {
      // given
      const challengeId = 15167432;
      const nextChallengeToAnswer = Symbol('nextChallengeToAnswer');
      const nextCertificationChallenge = { challengeId };
      const assessment = new Assessment({ id: 156, courseId: 54516 });

      certificationChallengeRepository.getNextNonAnsweredChallengeWithIndexByCourseId.resolves({ index: 1, challenge: nextCertificationChallenge });
      challengeRepository.get.resolves(nextChallengeToAnswer);

      // when
      const question = await getNextChallengeForCertification({ assessment, certificationChallengeRepository, challengeRepository });

      // then
      expect(question).to.deep.equal(new Question({ index: 1, challenge: nextChallengeToAnswer }));
      expect(challengeRepository.get).to.have.been.calledWith(challengeId);
    });
  });

});
