import _ from 'lodash';

import { CertificationChallenge } from '../../../../../../lib/domain/models/CertificationChallenge.js';
import { CERTIFICATION_VERSIONS } from '../../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import * as certificationChallengeRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-challenge-repository.js';
import { AssessmentEndedError } from '../../../../../../src/shared/domain/errors.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Certification Challenge', function () {
  describe('#save', function () {
    let certificationChallenge;

    beforeEach(async function () {
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;

      certificationChallenge = domainBuilder.buildCertificationChallenge({
        courseId: certificationCourseId,
        certifiableBadgeKey: 'PIX-PROUT',
      });
      certificationChallenge.id = undefined;
      await databaseBuilder.commit();
    });

    it('should return certification challenge object', async function () {
      const savedCertificationChallenge = await certificationChallengeRepository.save({ certificationChallenge });

      // then
      expect(savedCertificationChallenge).to.be.an.instanceOf(CertificationChallenge);
      expect(savedCertificationChallenge).to.have.property('id').and.not.null;
      expect(_.omit(savedCertificationChallenge, ['id', 'createdAt'])).to.deep.equal(
        _.omit(certificationChallenge, ['id', 'createdAt']),
      );
      expect(savedCertificationChallenge.createdAt).to.be.instanceOf(Date);
    });
  });

  describe('#getNextNonAnsweredChallengeByCourseId', function () {
    context('no non answered certification challenge', function () {
      let certificationCourseId, assessmentId;
      before(async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({}).id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        assessmentId = databaseBuilder.factory.buildAssessment({ userId, certificationCourseId }).id;
        const challenge = databaseBuilder.factory.buildCertificationChallenge({
          challengeId: 'recChallenge1',
          courseId: certificationCourseId,
          associatedSkill: '@brm7',
          competenceId: 'recCompetenceId1',
        });
        databaseBuilder.factory.buildAnswer({
          challengeId: challenge.challengeId,
          value: 'Un Pancake',
          assessmentId,
        });

        await databaseBuilder.commit();
      });

      it('should reject the promise if no non answered challenge is found', function () {
        // when
        const promise = certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId(
          assessmentId,
          certificationCourseId,
        );

        // then
        return expect(promise).to.be.rejectedWith(AssessmentEndedError);
      });
    });

    context('there is some non answered certification challenge(s)', function () {
      let certificationCourseId, assessmentId;
      const firstUnansweredChallengeId = 1;

      before(async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({}).id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        assessmentId = databaseBuilder.factory.buildAssessment({ userId, certificationCourseId }).id;
        const answeredChallenge = databaseBuilder.factory.buildCertificationChallenge({
          challengeId: 'recChallenge1',
          courseId: certificationCourseId,
          associatedSkill: '@brm7',
          competenceId: 'recCompetenceId1',
        });
        const firstUnansweredChallengeById = {
          id: firstUnansweredChallengeId,
          challengeId: 'recChallenge2',
          courseId: certificationCourseId,
          associatedSkill: '@brm24',
          competenceId: 'recCompetenceId2',
          createdAt: '2020-06-20T00:00:00Z',
        };
        const secondUnansweredChallengeById = {
          id: firstUnansweredChallengeId + 1,
          challengeId: 'recChallenge2',
          courseId: certificationCourseId,
          associatedSkill: '@brm24',
          competenceId: 'recCompetenceId2',
          createdAt: '2020-06-21T00:00:00Z',
        };

        // "Second" is inserted first as we check the order is chosen on the specified id
        databaseBuilder.factory.buildCertificationChallenge(secondUnansweredChallengeById);
        databaseBuilder.factory.buildCertificationChallenge(firstUnansweredChallengeById);
        databaseBuilder.factory.buildAnswer({
          challengeId: answeredChallenge.challengeId,
          value: 'Un Pancake',
          assessmentId,
        });

        await databaseBuilder.commit();
      });

      it('should get challenges in the creation order', async function () {
        // when
        const nextCertificationChallenge = await certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId(
          assessmentId,
          certificationCourseId,
        );

        // then
        expect(nextCertificationChallenge).to.be.instanceOf(CertificationChallenge);
        expect(nextCertificationChallenge.id).to.equal(firstUnansweredChallengeId);
      });
    });
  });

  describe('#getNextChallengeByCourseIdForV3', function () {
    context('all certification challenges are ignored', function () {
      let certificationCourseId, challengeId;
      before(async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({}).id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          version: CERTIFICATION_VERSIONS.V3,
        }).id;
        challengeId = databaseBuilder.factory.buildCertificationChallenge({
          challengeId: 'recChallenge1',
          courseId: certificationCourseId,
          associatedSkill: '@brm7',
          competenceId: 'recCompetenceId1',
        }).challengeId;

        await databaseBuilder.commit();
      });

      it('should return null if no non answered challenge is found', async function () {
        const ignoredChallengeIds = [challengeId];

        // when
        const result = await certificationChallengeRepository.getNextChallengeByCourseIdForV3(
          certificationCourseId,
          ignoredChallengeIds,
        );

        // then
        expect(result).to.be.null;
      });
    });

    context('there is some non ignored certification challenge(s)', function () {
      let certificationCourseId;
      const firstUnansweredChallengeId = 1;
      let ignoredChallengeIds;

      before(async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({}).id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          version: CERTIFICATION_VERSIONS.V3,
        }).id;

        const answeredChallenge = databaseBuilder.factory.buildCertificationChallenge({
          challengeId: 'recChallenge1',
          courseId: certificationCourseId,
          associatedSkillName: '@brm7',
          competenceId: 'recCompetenceId1',
        });
        ignoredChallengeIds = [answeredChallenge.challengeId];
        const firstUnansweredChallengeById = {
          id: firstUnansweredChallengeId,
          challengeId: 'recChallenge2',
          courseId: certificationCourseId,
          associatedSkillName: '@brm24',
          competenceId: 'recCompetenceId2',
          createdAt: '2020-06-20T00:00:00Z',
        };
        const secondUnansweredChallengeById = {
          id: firstUnansweredChallengeId + 1,
          challengeId: 'recChallenge2',
          courseId: certificationCourseId,
          associatedSkillName: '@brm24',
          competenceId: 'recCompetenceId2',
          createdAt: '2020-06-21T00:00:00Z',
        };

        // "Second" is inserted first as we check the order is chosen on the specified id
        databaseBuilder.factory.buildCertificationChallenge(secondUnansweredChallengeById);
        databaseBuilder.factory.buildCertificationChallenge(firstUnansweredChallengeById);

        await databaseBuilder.commit();
      });

      it('should get challenges in the creation order', async function () {
        // when
        const nextCertificationChallenge = await certificationChallengeRepository.getNextChallengeByCourseIdForV3(
          certificationCourseId,
          ignoredChallengeIds,
        );

        // then
        expect(nextCertificationChallenge).to.be.instanceOf(CertificationChallenge);
        expect(nextCertificationChallenge.id).to.equal(firstUnansweredChallengeId);
      });
    });
  });
});
