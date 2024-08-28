import * as userCertificabilityCalculatorRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/user-certificability-calculator-repository.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | certification | enrolment | UserCertificabilityCalculator', function () {
  describe('#getByUserId', function () {
    context('when no userCertificabilityCalculator found for user', function () {
      it('should return an empty UserCertificability', async function () {
        // when
        const userCertificabilityCalculator = await userCertificabilityCalculatorRepository.getByUserId({
          userId: 123,
        });

        // then
        expect(userCertificabilityCalculator).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            id: null,
            userId: 123,
            certificability: [],
            certificabilityV2: [],
            latestKnowledgeElementCreatedAt: null,
            latestCertificationDeliveredAt: null,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: null,
          }),
        );
      });
    });

    context('when userCertificabilityCalculator found for user', function () {
      it('should return the appropriate UserCertificability', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const anotherUserId = databaseBuilder.factory.buildUser().id;
        const id = databaseBuilder.factory.buildUserCertificability({
          userId,
          certificability: JSON.stringify([{ someKey: 'someVal' }]),
          certificabilityV2: JSON.stringify([{ someKeyV2: 'someValV2' }]),
          latestKnowledgeElementCreatedAt: new Date('2022-02-02'),
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: new Date('2023-03-03'),
          latestComplementaryCertificationBadgeDetachedAt: new Date('2024-04-04'),
        }).id;
        databaseBuilder.factory.buildUserCertificability({
          userId: anotherUserId,
          certificability: JSON.stringify([{ someOtherKey: 'someOtherVal' }]),
          certificabilityV2: JSON.stringify([{ someOtherKeyV2: 'someOtherValV2' }]),
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: new Date('2024-12-25'),
          latestComplementaryCertificationBadgeDetachedAt: null,
        });
        await databaseBuilder.commit();

        // when
        const userCertificabilityCalculator = await userCertificabilityCalculatorRepository.getByUserId({ userId });

        // then
        expect(userCertificabilityCalculator).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            id,
            userId,
            certificability: [{ someKey: 'someVal' }],
            certificabilityV2: [{ someKeyV2: 'someValV2' }],
            latestKnowledgeElementCreatedAt: new Date('2022-02-02'),
            latestCertificationDeliveredAt: null,
            latestBadgeAcquisitionUpdatedAt: new Date('2023-03-03'),
            latestComplementaryCertificationBadgeDetachedAt: new Date('2024-04-04'),
          }),
        );
      });
    });
  });

  describe('#getActivityDatesForUserId', function () {
    it('should return 4 dates : latestKnowledgeElementCreatedAt, latestCertificationDeliveredAt, latestBadgeAcquisitionUpdatedAt, latestComplementaryCertificationBadgeDetachedAt', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2020-01-02'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        createdAt: new Date('2020-01-03'),
      });
      const sessionId1 = databaseBuilder.factory.buildSession({
        publishedAt: new Date('2021-01-02'),
      }).id;
      const sessionId2 = databaseBuilder.factory.buildSession({
        publishedAt: new Date('2021-01-01'),
      }).id;
      const sessionId3 = databaseBuilder.factory.buildSession({
        publishedAt: new Date('2021-01-03'),
      }).id;
      databaseBuilder.factory.buildCertificationCourse({
        userId,
        sessionId: sessionId1,
      });
      databaseBuilder.factory.buildCertificationCourse({
        userId,
        sessionId: sessionId2,
      });
      databaseBuilder.factory.buildCertificationCourse({
        userId: anotherUserId,
        sessionId: sessionId3,
      });
      const badgeId = databaseBuilder.factory.buildBadge({
        isCertifiable: true,
      }).id;
      const notCertificableBadgeId = databaseBuilder.factory.buildBadge({
        isCertifiable: false,
      }).id;
      databaseBuilder.factory.buildBadgeAcquisition({
        userId,
        updatedAt: new Date('2022-01-02'),
        badgeId,
      });
      databaseBuilder.factory.buildBadgeAcquisition({
        userId,
        updatedAt: new Date('2022-01-01'),
        badgeId,
      });
      databaseBuilder.factory.buildBadgeAcquisition({
        userId,
        updatedAt: new Date('2022-01-03'),
        badgeId: notCertificableBadgeId,
      });
      databaseBuilder.factory.buildBadgeAcquisition({
        userId: anotherUserId,
        updatedAt: new Date('2022-01-04'),
        badgeId,
      });
      const complementaryCertificationId1 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'key1',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        detachedAt: null,
        complementaryCertificationId: complementaryCertificationId1,
      });
      const complementaryCertificationId2 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'key2',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        detachedAt: new Date('2023-01-02'),
        complementaryCertificationId: complementaryCertificationId2,
      });
      const complementaryCertificationId3 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'key3',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        detachedAt: new Date('2023-01-01'),
        complementaryCertificationId: complementaryCertificationId3,
      });
      await databaseBuilder.commit();

      // when
      const {
        latestKnowledgeElementCreatedAt,
        latestCertificationDeliveredAt,
        latestBadgeAcquisitionUpdatedAt,
        latestComplementaryCertificationBadgeDetachedAt,
      } = await userCertificabilityCalculatorRepository.getActivityDatesForUserId({ userId });

      // then
      expect(latestKnowledgeElementCreatedAt).to.deep.equal(new Date('2020-01-02'));
      expect(latestCertificationDeliveredAt).to.deep.equal(new Date('2021-01-02'));
      expect(latestBadgeAcquisitionUpdatedAt).to.deep.equal(new Date('2022-01-02'));
      expect(latestComplementaryCertificationBadgeDetachedAt).to.deep.equal(new Date('2023-01-02'));
    });
  });

  describe('#save', function () {
    let clock;
    const now = new Date('2024-08-01T11:15:00Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
      return knex('user-certificabilities').del();
    });

    context('when userCertificabilityCalculator did not exist before', function () {
      it('should add userCertificabilityCalculator to database', async function () {
        // given
        const someDate = new Date('2020-01-01');
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        const userCertificabilityToSave = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: null,
          userId,
          certificability: [{ someKey: 'some data' }],
          certificabilityV2: [{ someKeyV2: 'some dataV2' }],
          latestKnowledgeElementCreatedAt: someDate,
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        });

        // when
        await userCertificabilityCalculatorRepository.save({ userCertificabilityToSave });

        // then
        const savedUserCertificability = await userCertificabilityCalculatorRepository.getByUserId({ userId });
        sinon.assert.match(savedUserCertificability, {
          id: sinon.match.number,
          userId,
          draftCertificability: [{ someKey: 'some data' }],
          draftCertificabilityV2: [{ someKeyV2: 'some dataV2' }],
          latestKnowledgeElementCreatedAt: someDate,
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        });
      });
    });

    context('when userCertificabilityCalculator already exists', function () {
      it('should update userCertificabilityCalculator in database', async function () {
        // given
        const someDate = new Date('2020-01-01');
        const userId = databaseBuilder.factory.buildUser().id;
        const id = databaseBuilder.factory.buildUserCertificability({
          userId,
          certificability: [],
          certificabilityV2: [],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: someDate,
          latestBadgeAcquisitionUpdatedAt: someDate,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        }).id;
        await databaseBuilder.commit();

        const userCertificabilityToSave = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id,
          userId,
          certificability: [{ someKey: 'some data' }],
          certificabilityV2: [{ someKeyV2: 'some dataV2' }],
          latestKnowledgeElementCreatedAt: someDate,
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: someDate,
        });

        // when
        await userCertificabilityCalculatorRepository.save({ userCertificabilityToSave });

        // then
        const savedUserCertificability = await userCertificabilityCalculatorRepository.getByUserId({ userId });
        expect(savedUserCertificability).to.deepEqualInstance(
          domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
            id,
            userId,
            certificability: [{ someKey: 'some data' }],
            certificabilityV2: [{ someKeyV2: 'some dataV2' }],
            latestKnowledgeElementCreatedAt: someDate,
            latestCertificationDeliveredAt: null,
            latestBadgeAcquisitionUpdatedAt: null,
            latestComplementaryCertificationBadgeDetachedAt: someDate,
          }),
        );
        const userCertificabilityForUserInDB = await knex('user-certificabilities').select('updatedAt');
        expect(userCertificabilityForUserInDB.length).to.equal(1);
        expect(userCertificabilityForUserInDB[0].updatedAt).to.deep.equal(now);
      });
    });
  });

  describe('#getHighestPixScoreObtainedInCoreCertification', function () {
    let userId;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    context('KO cases', function () {
      it('should return -1 when user has never passed any certification', async function () {
        // when
        const highestPixScoreObtainedInCoreCertification =
          await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({ userId });

        // then
        expect(highestPixScoreObtainedInCoreCertification).to.equal(-1);
      });

      it('should return -1 when user certification is not published', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          isPublished: false,
          isCancelled: false,
          isRejectedForFraud: false,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId,
          status: AssessmentResult.status.VALIDATED,
          pixScore: 30,
        });
        await databaseBuilder.commit();

        // when
        const highestPixScoreObtainedInCoreCertification =
          await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({ userId });

        // then
        expect(highestPixScoreObtainedInCoreCertification).to.equal(-1);
      });

      it('should return -1 when user certification has been cancelled', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          isPublished: true,
          isCancelled: true,
          isRejectedForFraud: false,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId,
          status: AssessmentResult.status.VALIDATED,
          pixScore: 30,
        });
        await databaseBuilder.commit();

        // when
        const highestPixScoreObtainedInCoreCertification =
          await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({ userId });

        // then
        expect(highestPixScoreObtainedInCoreCertification).to.equal(-1);
      });

      it('should return -1 when user certification has been rejected for fraud', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          isPublished: true,
          isCancelled: false,
          isRejectedForFraud: true,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId,
          status: AssessmentResult.status.VALIDATED,
          pixScore: 30,
        });
        await databaseBuilder.commit();

        // when
        const highestPixScoreObtainedInCoreCertification =
          await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({ userId });

        // then
        expect(highestPixScoreObtainedInCoreCertification).to.equal(-1);
      });

      it('should return -1 when user certification is not validated', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          isPublished: true,
          isCancelled: false,
          isRejectedForFraud: false,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId,
          status: AssessmentResult.status.REJECTED,
          pixScore: 30,
        });
        await databaseBuilder.commit();

        // when
        const highestPixScoreObtainedInCoreCertification =
          await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({ userId });

        // then
        expect(highestPixScoreObtainedInCoreCertification).to.equal(-1);
      });

      it('should return -1 when user certification has a NULL pixScore', async function () {
        // given
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          userId,
          isPublished: true,
          isCancelled: false,
          isRejectedForFraud: false,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId,
          status: AssessmentResult.status.VALIDATED,
          pixScore: null,
        });
        await databaseBuilder.commit();

        // when
        const highestPixScoreObtainedInCoreCertification =
          await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({ userId });

        // then
        expect(highestPixScoreObtainedInCoreCertification).to.equal(-1);
      });
    });

    context('OK case', function () {
      it('should return the highest obtained score amongst all the user certifications', async function () {
        // given
        const certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({
          userId,
          isPublished: true,
          isCancelled: false,
          isRejectedForFraud: false,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourseId1,
          status: AssessmentResult.status.VALIDATED,
          pixScore: 25,
        });
        const certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({
          userId,
          isPublished: true,
          isCancelled: false,
          isRejectedForFraud: false,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourseId2,
          status: AssessmentResult.status.VALIDATED,
          pixScore: 50,
        }).id;
        const anotherUserId = databaseBuilder.factory.buildUser().id;
        const certificationCourseId3 = databaseBuilder.factory.buildCertificationCourse({
          userId: anotherUserId,
          isPublished: true,
          isCancelled: false,
          isRejectedForFraud: false,
        }).id;
        databaseBuilder.factory.buildAssessmentResult.last({
          certificationCourseId: certificationCourseId3,
          status: AssessmentResult.status.VALIDATED,
          pixScore: 80,
        }).id;
        await databaseBuilder.commit();

        // when
        const highestPixScoreObtainedInCoreCertification =
          await userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification({ userId });

        // then
        expect(highestPixScoreObtainedInCoreCertification).to.equal(50);
      });
    });
  });

  describe('#findMinimumEarnedPixValuesByComplementaryCertificationBadgeId', function () {
    it('should return a key value result with complementaryCertificationBadgeId as key and minimumEarnedPix as value, ignoring detached ones', async function () {
      // given
      const complementaryCertificationId1 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'someKey1',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 1,
        minimumEarnedPix: 0,
        detachedAt: null,
        complementaryCertificationId: complementaryCertificationId1,
      });
      const complementaryCertificationId2 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'someKey2',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 2,
        minimumEarnedPix: 10,
        detachedAt: new Date('2020-01-01'),
        complementaryCertificationId: complementaryCertificationId2,
      });
      const complementaryCertificationId3 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'someKey3',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 3,
        minimumEarnedPix: 20,
        detachedAt: null,
        complementaryCertificationId: complementaryCertificationId3,
      });
      await databaseBuilder.commit();

      // when
      const minimumEarnedPixValuesByComplementaryCertificationBadgeId =
        await userCertificabilityCalculatorRepository.findMinimumEarnedPixValuesByComplementaryCertificationBadgeId();

      // then
      expect(minimumEarnedPixValuesByComplementaryCertificationBadgeId).to.deep.equal({
        1: 0,
        3: 20,
      });
    });
  });

  describe('#findHowManyVersionsBehindByComplementaryCertificationBadgeId', function () {
    it('should return a key value result with complementaryCertificationBadgeId as key and versionsBehind as value', async function () {
      // given
      const complementaryCertificationId1 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'someKey1',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 1,
        level: 1,
        detachedAt: null,
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 2,
        level: 1,
        detachedAt: new Date('2021-01-01'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 3,
        level: 1,
        detachedAt: new Date('2022-02-02'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 4,
        level: 2,
        detachedAt: new Date('2021-01-01'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 5,
        level: 2,
        detachedAt: new Date('2022-02-02'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      const complementaryCertificationId2 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'someKey2',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 6,
        level: 1,
        detachedAt: new Date('2023-03-03'),
        complementaryCertificationId: complementaryCertificationId2,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 7,
        level: 1,
        detachedAt: null,
        complementaryCertificationId: complementaryCertificationId2,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 8,
        level: 1,
        detachedAt: new Date('2024-04-04'),
        complementaryCertificationId: complementaryCertificationId2,
      });
      await databaseBuilder.commit();

      // when
      const howManyVersionsBehindByComplementaryCertificationBadgeId =
        await userCertificabilityCalculatorRepository.findHowManyVersionsBehindByComplementaryCertificationBadgeId();

      // then
      expect(howManyVersionsBehindByComplementaryCertificationBadgeId).to.deep.equal({
        1: 0,
        2: 2,
        3: 1,
        4: 2,
        5: 1,
        6: 2,
        7: 0,
        8: 1,
      });
    });
  });
});
