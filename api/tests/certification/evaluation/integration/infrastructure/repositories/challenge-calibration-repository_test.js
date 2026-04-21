import { ChallengeCalibration } from '../../../../../../src/certification/evaluation/domain/read-models/ChallengeCalibration.js';
import { getByCertificationCourseId } from '../../../../../../src/certification/evaluation/infrastructure/repositories/challenge-calibration-repository.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Infrastructure | Repository | ChallengeCalibrationRepository', function () {
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

        expect(challenges).to.have.lengthOf(0);
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

        expect(challenges).to.have.lengthOf(3);
        expect(challenges[0]).to.be.instanceOf(ChallengeCalibration);
        expect(challenges[0].id).to.equal('challenge_id_1');
        expect(challenges[1].id).to.equal('challenge_id_2');
        expect(challenges[2].id).to.equal('challenge_id_3');
      });
    });
  });
});
