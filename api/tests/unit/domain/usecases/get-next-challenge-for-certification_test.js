const { expect, sinon } = require('../../../test-helper');

const getNextChallengeForCertification = require('../../../../lib/domain/usecases/get-next-challenge-for-certification');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Challenge = require('../../../../lib/domain/models/Challenge');

describe('Unit | Domain | Use Cases | get-next-challenge-for-certification', () => {

  describe('#getNextChallengeForCertification', () => {

    let certificationChallengeRepository;
    let challengeRepository;

    beforeEach(() => {
      certificationChallengeRepository = { getNonAnsweredChallengeByCourseId: sinon.stub().resolves() };
      challengeRepository = { get: sinon.stub().resolves() };
    });

    it('should use the assessmentService to select the next CertificationChallenge', async () => {
      // given
      const nextChallenge = Symbol('nextChallenge');
      const assessment = Assessment.fromAttributes({ id: 156, certificationCourseId: 54516 });

      certificationChallengeRepository.getNonAnsweredChallengeByCourseId.resolves(nextChallenge);

      // when
      await getNextChallengeForCertification({ assessment, certificationChallengeRepository, challengeRepository });

      // then
      expect(certificationChallengeRepository.getNonAnsweredChallengeByCourseId).to.have.been.calledWith(156, 54516);
    });

    it('should return the next Challenge', async () => {
      // given
      const challengeId = 15167432;
      const nextChallengeToAnswer = Challenge.fromAttributes({ challengeId, skills : [] });
      const nextCertificationChallenge = { challengeId };
      const assessment = Assessment.fromAttributes({ id: 156, courseId: 54516 });

      certificationChallengeRepository.getNonAnsweredChallengeByCourseId.resolves(nextCertificationChallenge);
      challengeRepository.get.resolves(nextChallengeToAnswer);

      // when
      const challenge = await getNextChallengeForCertification({ assessment, certificationChallengeRepository, challengeRepository });

      // then
      expect(challenge).to.be.an.instanceOf(Challenge);
      expect(challenge).to.equal(nextChallengeToAnswer);
      expect(challengeRepository.get).to.have.been.calledWith(challengeId);
    });
  });

});
