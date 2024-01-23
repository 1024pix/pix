import { databaseBuilder, expect } from '../../../../../test-helper.js';
import { getByCertificationCourseId } from '../../../../../../src/certification/scoring/infrastructure/repositories/certification-challenge-for-scoring-repository.js';
import { CertificationChallengeForScoring } from '../../../../../../src/certification/scoring/domain/models/CertificationChallengeForScoring.js';

describe('Integration | Infrastructure | Repository | CertificationChallengeForScoringRepository', function () {
  describe('#getByCertificationCourseId', function () {
    let certificationCourseId;

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;

      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        userId,
        sessionId,
      }).id;

      await databaseBuilder.commit();
    });
    describe('when there is no challenge', function () {
      it('should return an empty array', async function () {
        const challenges = await getByCertificationCourseId({ certificationCourseId });

        expect(challenges.length).to.equal(0);
      });
    });

    describe('when there are 2 challenges', function () {
      it('should return all certification challenges for scoring for the certification course', async function () {
        databaseBuilder.factory.buildCertificationChallenge({
          id: 1,
          challengeId: 'challenge_id_1',
          courseId: certificationCourseId,
          discriminant: 1.1,
          difficulty: 1,
        });

        databaseBuilder.factory.buildCertificationChallenge({
          id: 2,
          challengeId: 'challenge_id_2',
          courseId: certificationCourseId,
          discriminant: 1.2,
          difficulty: 1,
        });

        await databaseBuilder.commit();

        const challenges = await getByCertificationCourseId({ certificationCourseId });

        expect(challenges.length).to.equal(2);
        expect(challenges[0]).to.be.instanceOf(CertificationChallengeForScoring);
      });
    });
  });
});
