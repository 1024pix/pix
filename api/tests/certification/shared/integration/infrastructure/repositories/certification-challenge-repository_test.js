import _ from 'lodash';

import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationChallenge } from '../../../../../../src/certification/shared/domain/models/CertificationChallenge.js';
import * as certificationChallengeRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-challenge-repository.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

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

  describe('#getNextChallengeByCourseId', function () {
    context('all certification challenges are ignored', function () {
      let certificationCourseId, challengeId;

      before(async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({}).id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          version: AlgorithmEngineVersion.V3,
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
        const result = await certificationChallengeRepository.getNextChallengeByCourseId(
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
          version: AlgorithmEngineVersion.V3,
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
        const nextCertificationChallenge = await certificationChallengeRepository.getNextChallengeByCourseId(
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
