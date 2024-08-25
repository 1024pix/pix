import dayjs from 'dayjs';

import { UserCertificability } from '../../../../../../src/certification/enrolment/domain/models/UserCertificability.js';
import { getUserCertificability } from '../../../../../../src/certification/enrolment/domain/services/get-user-certificability.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | Services | getUserCertificability', function () {
  const userId = 123;
  let userCertificabilityCalculatorRepository;
  let knowledgeElementRepository;
  let competenceRepository;
  let complementaryCertificationCourseRepository;
  let certificationBadgesService;
  let dependencies;
  let clock;
  const now = new Date('2024-08-01T11:15:00Z');

  beforeEach(function () {
    userCertificabilityCalculatorRepository = {
      getByUserId: sinon.stub(),
      getActivityDatesForUserId: sinon.stub(),
      save: sinon.stub(),
      findMinimumEarnedPixValuesByComplementaryCertificationBadgeId: sinon.stub(),
      getHighestPixScoreObtainedInCoreCertification: sinon.stub(),
    };
    knowledgeElementRepository = {
      findUniqByUserId: sinon.stub(),
    };
    competenceRepository = {
      listPixCompetencesOnly: sinon.stub(),
    };
    complementaryCertificationCourseRepository = {
      findByUserId: sinon.stub(),
    };
    certificationBadgesService = {
      findLatestBadgeAcquisitions: sinon.stub(),
    };
    dependencies = {
      userId,
      userCertificabilityCalculatorRepository,
      knowledgeElementRepository,
      competenceRepository,
      complementaryCertificationCourseRepository,
      certificationBadgesService,
    };
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
  });

  afterEach(function () {
    clock.restore();
  });

  context('when user has a certificability in database', function () {
    let currentLatestKnowledgeElementCreatedAt;
    let currentLatestCertificationDeliveredAt;
    let currentLatestBadgeAcquisitionUpdatedAt;
    let currentLatestComplementaryCertificationBadgeDetachedAt;

    beforeEach(function () {
      currentLatestKnowledgeElementCreatedAt = new Date('2021-01-01');
      currentLatestCertificationDeliveredAt = new Date('2022-02-02');
      currentLatestBadgeAcquisitionUpdatedAt = new Date('2023-03-03');
      currentLatestComplementaryCertificationBadgeDetachedAt = new Date('2024-04-04');
    });

    context('when user has had no activity that requires an update of its certificability', function () {
      it('should return their certificability without computing nor persisting', async function () {
        // given
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 1,
          userId,
          certificability: [{ key: 'someVal' }],
          certificabilityV2: [{ keyV2: 'someValV2' }],
          latestKnowledgeElementCreatedAt: currentLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: currentLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: currentLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: currentLatestComplementaryCertificationBadgeDetachedAt,
        });
        const computeCoreCertificabilitySpy = sinon.spy(userCertificabilityCalculator, 'computeCoreCertificability');
        const computeComplementaryCertificabilitiesSpy = sinon.spy(
          userCertificabilityCalculator,
          'computeComplementaryCertificabilities',
        );
        const buildUserCertificabilitySpy = sinon.spy(userCertificabilityCalculator, 'buildUserCertificability');
        userCertificabilityCalculatorRepository.getByUserId
          .withArgs({ userId })
          .resolves(userCertificabilityCalculator);
        userCertificabilityCalculatorRepository.getActivityDatesForUserId.withArgs({ userId }).resolves({
          latestKnowledgeElementCreatedAt: currentLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: currentLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: currentLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: currentLatestComplementaryCertificationBadgeDetachedAt,
        });

        // when
        const actualUserCertificability = await getUserCertificability(dependencies);

        // then
        expect(actualUserCertificability).to.be.instanceOf(UserCertificability);
        expect(userCertificabilityCalculatorRepository.save).to.not.have.been.called;
        expect(computeCoreCertificabilitySpy).to.not.have.been.called;
        expect(computeComplementaryCertificabilitiesSpy).to.not.have.been.called;
        expect(buildUserCertificabilitySpy).to.have.been.calledOnce;
      });
    });

    context('when user has had activity that required an update', function () {
      let newLatestKnowledgeElementCreatedAt;
      let userCertificabilityCalculator;

      beforeEach(function () {
        newLatestKnowledgeElementCreatedAt = dayjs(currentLatestKnowledgeElementCreatedAt).add(1, 'day').toDate();
        userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: 1,
          userId,
          certificability: [{ key: 'someVal' }],
          certificabilityV2: [{ keyV2: 'someValV2' }],
          latestKnowledgeElementCreatedAt: currentLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: currentLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: currentLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: currentLatestComplementaryCertificationBadgeDetachedAt,
        });
        userCertificabilityCalculatorRepository.getByUserId
          .withArgs({ userId })
          .resolves(userCertificabilityCalculator);
        userCertificabilityCalculatorRepository.getActivityDatesForUserId.withArgs({ userId }).resolves({
          latestKnowledgeElementCreatedAt: newLatestKnowledgeElementCreatedAt,
          latestCertificationDeliveredAt: currentLatestCertificationDeliveredAt,
          latestBadgeAcquisitionUpdatedAt: currentLatestBadgeAcquisitionUpdatedAt,
          latestComplementaryCertificationBadgeDetachedAt: currentLatestComplementaryCertificationBadgeDetachedAt,
        });
      });

      it('should compute core certificability, complementary certificability for each of them and persist', async function () {
        // given
        const knowledgeElements = [domainBuilder.buildKnowledgeElement()];
        const coreCompetences = [domainBuilder.buildCompetence()];
        knowledgeElementRepository.findUniqByUserId
          .withArgs({
            userId,
            limitDate: now,
          })
          .resolves(knowledgeElements);
        competenceRepository.listPixCompetencesOnly.resolves(coreCompetences);
        const certifiableBadgeAcquisition1 = domainBuilder.buildCertifiableBadgeAcquisition({
          complementaryCertificationBadgeId: 111,
        });
        const certifiableBadgeAcquisition2 = domainBuilder.buildCertifiableBadgeAcquisition({
          complementaryCertificationBadgeId: 222,
        });
        certificationBadgesService.findLatestBadgeAcquisitions
          .withArgs({
            userId,
            limitDate: now,
          })
          .resolves([certifiableBadgeAcquisition1, certifiableBadgeAcquisition2]);
        const highestPixScore = 999;
        const minimumEarnedPixValuesByComplementaryCertificationBadgeId = {
          111: 2000,
          222: 6000,
        };
        userCertificabilityCalculatorRepository.getHighestPixScoreObtainedInCoreCertification
          .withArgs({ userId })
          .resolves(highestPixScore);
        userCertificabilityCalculatorRepository.findMinimumEarnedPixValuesByComplementaryCertificationBadgeId
          .withArgs()
          .resolves(minimumEarnedPixValuesByComplementaryCertificationBadgeId);
        const computeCoreCertificabilitySpy = sinon.spy(userCertificabilityCalculator, 'computeCoreCertificability');
        const computeComplementaryCertificabilitiesSpy = sinon.spy(
          userCertificabilityCalculator,
          'computeComplementaryCertificabilities',
        );
        const buildUserCertificabilitySpy = sinon.spy(userCertificabilityCalculator, 'buildUserCertificability');

        // when
        const actualUserCertificability = await getUserCertificability(dependencies);

        // then
        expect(actualUserCertificability).to.be.instanceOf(UserCertificability);
        expect(userCertificabilityCalculatorRepository.save).to.have.been.calledWithExactly(
          userCertificabilityCalculator,
        );
        expect(computeCoreCertificabilitySpy).to.have.been.calledWithExactly({
          allKnowledgeElements: knowledgeElements,
          coreCompetences,
        });
        expect(computeComplementaryCertificabilitiesSpy).to.have.been.calledWithExactly({
          certifiableBadgeAcquisitions: [certifiableBadgeAcquisition1, certifiableBadgeAcquisition2],
          minimumEarnedPixValuesByComplementaryCertificationBadgeId,
          highestPixScoreObtainedInCoreCertification: highestPixScore,
          complementaryCertificationCourseWithResults: [],
        });
        expect(buildUserCertificabilitySpy).to.have.been.calledOnce;
      });
    });
  });

  context('when user has no certificability in database', function () {
    context('when user has had no activity that requires an update of its certificability', function () {
      it('should return their empty certificability without computing nor persisting', async function () {
        // given
        const userCertificabilityCalculator = domainBuilder.certification.enrolment.buildUserCertificabilityCalculator({
          id: null,
          userId,
          certificability: [],
          certificabilityV2: [],
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        });
        const computeCoreCertificabilitySpy = sinon.spy(userCertificabilityCalculator, 'computeCoreCertificability');
        const computeComplementaryCertificabilitiesSpy = sinon.spy(
          userCertificabilityCalculator,
          'computeComplementaryCertificabilities',
        );
        const buildUserCertificabilitySpy = sinon.spy(userCertificabilityCalculator, 'buildUserCertificability');
        userCertificabilityCalculatorRepository.getByUserId
          .withArgs({ userId })
          .resolves(userCertificabilityCalculator);
        userCertificabilityCalculatorRepository.getActivityDatesForUserId.withArgs({ userId }).resolves({
          latestKnowledgeElementCreatedAt: null,
          latestCertificationDeliveredAt: null,
          latestBadgeAcquisitionUpdatedAt: null,
          latestComplementaryCertificationBadgeDetachedAt: null,
        });

        // when
        const actualUserCertificability = await getUserCertificability(dependencies);

        // then
        expect(actualUserCertificability).to.be.instanceOf(UserCertificability);
        expect(userCertificabilityCalculatorRepository.save).to.not.have.been.called;
        expect(computeCoreCertificabilitySpy).to.not.have.been.called;
        expect(computeComplementaryCertificabilitiesSpy).to.not.have.been.called;
        expect(buildUserCertificabilitySpy).to.have.been.calledOnce;
      });
    });
  });
});
