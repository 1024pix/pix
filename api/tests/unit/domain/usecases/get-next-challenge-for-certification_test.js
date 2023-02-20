import { expect, sinon } from '../../../test-helper';
import getNextChallengeForCertification from '../../../../lib/domain/usecases/get-next-challenge-for-certification';
import Assessment from '../../../../lib/domain/models/Assessment';

describe('Unit | Domain | Use Cases | get-next-challenge-for-certification', function () {
  describe('#getNextChallengeForCertification', function () {
    let certificationChallengeRepository;
    let challengeRepository;

    beforeEach(function () {
      certificationChallengeRepository = { getNextNonAnsweredChallengeByCourseId: sinon.stub().resolves() };
      challengeRepository = { get: sinon.stub().resolves() };
    });

    it('should use the assessmentService to select the next CertificationChallenge', async function () {
      // given
      const nextChallenge = Symbol('nextChallenge');
      const assessment = new Assessment({ id: 156, certificationCourseId: 54516 });

      certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId.resolves(nextChallenge);

      // when
      await getNextChallengeForCertification({ assessment, certificationChallengeRepository, challengeRepository });

      // then
      expect(certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId).to.have.been.calledWith(
        156,
        54516
      );
    });

    it('should return the next Challenge', async function () {
      // given
      const challengeId = 15167432;
      const nextChallengeToAnswer = Symbol('nextChallengeToAnswer');
      const nextCertificationChallenge = { challengeId };
      const assessment = new Assessment({ id: 156, courseId: 54516 });

      certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId.resolves(nextCertificationChallenge);
      challengeRepository.get.resolves(nextChallengeToAnswer);

      // when
      const challenge = await getNextChallengeForCertification({
        assessment,
        certificationChallengeRepository,
        challengeRepository,
      });

      // then
      expect(challenge).to.equal(nextChallengeToAnswer);
      expect(challengeRepository.get).to.have.been.calledWith(challengeId);
    });
  });
});
