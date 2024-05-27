import { CertificationChallengeForScoring } from '../../../../../../src/certification/scoring/domain/models/CertificationChallengeForScoring.js';
import { getByCertificationCourseId } from '../../../../../../src/certification/scoring/infrastructure/repositories/certification-challenge-for-scoring-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

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

    describe('when there are 2 or more challenges', function () {
      it('should return all certification challenges for scoring for the certification course ordered by creation date', async function () {
        databaseBuilder.factory.buildCertificationChallenge({
          id: 1,
          challengeId: 'challenge_id_1',
          courseId: certificationCourseId,
          discriminant: 1.1,
          difficulty: 1,
          createdAt: new Date('2020-01-01T00:00:00Z'),
        });

        databaseBuilder.factory.buildCertificationChallenge({
          id: 3,
          challengeId: 'challenge_id_3',
          courseId: certificationCourseId,
          discriminant: 1.2,
          difficulty: 1,
          createdAt: new Date('2020-01-03T00:00:00Z'),
        });

        databaseBuilder.factory.buildCertificationChallenge({
          id: 2,
          challengeId: 'challenge_id_2',
          courseId: certificationCourseId,
          discriminant: 1.2,
          difficulty: 1,
          createdAt: new Date('2020-01-02T00:00:00Z'),
        });

        await databaseBuilder.commit();

        const challenges = await getByCertificationCourseId({ certificationCourseId });

        expect(challenges.length).to.equal(3);
        expect(challenges[0]).to.be.instanceOf(CertificationChallengeForScoring);
        expect(challenges[0].id).to.equal('challenge_id_1');
        expect(challenges[1].id).to.equal('challenge_id_2');
        expect(challenges[2].id).to.equal('challenge_id_3');
      });
    });
  });
});
