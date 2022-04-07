const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const CertificationRescoringCompleted = require('../../../../lib/domain/events/CertificationRescoringCompleted');
const { handleCleaCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const { CLEA } = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Unit | Domain | Events | handle-clea-certification-scoring', function () {
  let partnerCertificationScoringRepository;
  let certificationCourseRepository;
  let badgeRepository;
  let knowledgeElementRepository;
  let targetProfileRepository;
  let badgeCriteriaService;
  let complementaryCertificationCourseRepository;

  beforeEach(function () {
    partnerCertificationScoringRepository = {
      buildCleaCertificationScoring: sinon.stub(),
      save: sinon.stub(),
    };

    badgeRepository = {
      getByKey: sinon.stub(),
    };

    knowledgeElementRepository = {
      findUniqByUserId: sinon.stub(),
    };

    targetProfileRepository = {
      get: sinon.stub(),
    };

    badgeCriteriaService = {
      areBadgeCriteriaFulfilled: sinon.stub(),
    };

    certificationCourseRepository = {
      getCreationDate: sinon.stub(),
    };

    complementaryCertificationCourseRepository = { getComplementaryCertificationCourseId: sinon.stub() };
  });

  context('check event', function () {
    it('fails when event is not an event', async function () {
      // when / then
      const event = 'not a good event';
      const error = await catchErr(handleCleaCertificationScoring)({
        event,
        partnerCertificationScoringRepository,
        badgeRepository,
        knowledgeElementRepository,
        certificationCourseRepository,
        targetProfileRepository,
        badgeCriteriaService,
        complementaryCertificationCourseRepository,
      });

      // then
      expect(error.message).to.equal(
        'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted'
      );
    });

    it('does not fail if event is of correct type CertificationScoringCompleted', async function () {
      // when / then
      const event = new CertificationRescoringCompleted({});
      const error = await catchErr(handleCleaCertificationScoring)({
        event,
        partnerCertificationScoringRepository,
        badgeRepository,
        knowledgeElementRepository,
        certificationCourseRepository,
        targetProfileRepository,
        badgeCriteriaService,
        complementaryCertificationCourseRepository,
      });

      // then
      expect(error.message).not.to.equal(
        'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted'
      );
    });

    it('does not fail if event is of correct type CertificationRescoringCompleted', async function () {
      // given
      const event = new CertificationRescoringCompleted({});
      // when / then
      const error = await catchErr(handleCleaCertificationScoring)({
        event,
        partnerCertificationScoringRepository,
        badgeRepository,
        knowledgeElementRepository,
        certificationCourseRepository,
        targetProfileRepository,
        badgeCriteriaService,
        complementaryCertificationCourseRepository,
      });

      // then
      expect(error.message).not.to.equal('event must be one of types CertificationScoringCompleted');
    });
  });

  context('#handleCleaCertificationScoring', function () {
    context('when scoring', function () {
      context('when cleA certification has been started', function () {
        it('should save a certif partner', async function () {
          // given
          const userId = 1234;
          const certificationCourseId = 4567;
          const complementaryCertificationCourseId = 999;
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ userId }),
            domainBuilder.buildKnowledgeElement({ userId }),
          ];
          const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
            complementaryCertificationCourseId,
            reproducibilityRate: 85,
            hasAcquiredBadge: true,
          });
          const targetProfile = domainBuilder.buildTargetProfile({ id: 34435 });
          const badge = domainBuilder.buildBadge({ targetProfileId: 34435 });
          const event = new CertificationScoringCompleted({
            certificationCourseId,
            userId,
            isCertification: true,
            reproducibilityRate: 85,
          });
          const date = '2021-01-01';

          partnerCertificationScoringRepository.buildCleaCertificationScoring
            .withArgs({
              complementaryCertificationCourseId,
              certificationCourseId,
              userId,
              reproducibilityRate: 85,
            })
            .resolves(cleaCertificationScoring);

          certificationCourseRepository.getCreationDate.withArgs(certificationCourseId).resolves(date);

          badgeRepository.getByKey.resolves(badge);

          targetProfileRepository.get.withArgs(34435).resolves(targetProfile);

          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId: event.userId, limitDate: date })
            .resolves(knowledgeElements);

          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ knowledgeElements, targetProfile, badge })
            .returns(true);

          complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
            .withArgs({
              certificationCourseId,
              complementaryCertificationName: CLEA,
            })
            .resolves(complementaryCertificationCourseId);

          // when
          await handleCleaCertificationScoring({
            event,
            partnerCertificationScoringRepository,
            badgeRepository,
            knowledgeElementRepository,
            certificationCourseRepository,
            targetProfileRepository,
            badgeCriteriaService,
            complementaryCertificationCourseRepository,
          });

          // then
          expect(partnerCertificationScoringRepository.save).to.have.been.calledWithMatch({
            partnerCertificationScoring: cleaCertificationScoring,
          });
        });
      });

      context('when cleA certification has not been started', function () {
        it('should not save a certif partner', async function () {
          // given
          const userId = 1234;
          const certificationCourseId = 4567;
          complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
            .withArgs({
              certificationCourseId,
              complementaryCertificationName: CLEA,
            })
            .resolves(undefined);

          const event = new CertificationScoringCompleted({
            certificationCourseId,
            userId,
            isCertification: true,
            reproducibilityRate: 85,
          });

          // when
          await handleCleaCertificationScoring({
            event,
            partnerCertificationScoringRepository,
            badgeRepository,
            knowledgeElementRepository,
            certificationCourseRepository,
            targetProfileRepository,
            badgeCriteriaService,
            complementaryCertificationCourseRepository,
          });

          // then
          expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
        });
      });
    });

    context('when rescoring', function () {
      context('when cleA certification has been started', function () {
        it('should save a certif partner', async function () {
          // given
          const userId = 1234;
          const certificationCourseId = 4567;
          const complementaryCertificationCourseId = 999;
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ userId }),
            domainBuilder.buildKnowledgeElement({ userId }),
          ];
          const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
            complementaryCertificationCourseId,
            reproducibilityRate: 85,
            hasAcquiredBadge: true,
          });
          const targetProfile = domainBuilder.buildTargetProfile({ id: 34435 });
          const badge = domainBuilder.buildBadge({ targetProfileId: 34435 });
          const event = new CertificationRescoringCompleted({
            certificationCourseId,
            userId,
            isCertification: true,
            reproducibilityRate: 85,
          });
          const date = '2021-01-01';

          partnerCertificationScoringRepository.buildCleaCertificationScoring
            .withArgs({
              complementaryCertificationCourseId,
              certificationCourseId,
              userId,
              reproducibilityRate: 85,
            })
            .resolves(cleaCertificationScoring);

          certificationCourseRepository.getCreationDate.withArgs(certificationCourseId).resolves(date);

          badgeRepository.getByKey.resolves(badge);

          targetProfileRepository.get.withArgs(34435).resolves(targetProfile);

          knowledgeElementRepository.findUniqByUserId
            .withArgs({ userId: event.userId, limitDate: date })
            .resolves(knowledgeElements);

          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ knowledgeElements, targetProfile, badge })
            .returns(true);

          complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
            .withArgs({
              certificationCourseId,
              complementaryCertificationName: CLEA,
            })
            .resolves(complementaryCertificationCourseId);

          // when
          await handleCleaCertificationScoring({
            event,
            partnerCertificationScoringRepository,
            badgeRepository,
            knowledgeElementRepository,
            certificationCourseRepository,
            targetProfileRepository,
            badgeCriteriaService,
            complementaryCertificationCourseRepository,
          });

          // then
          expect(partnerCertificationScoringRepository.save).to.have.been.calledWithMatch({
            partnerCertificationScoring: cleaCertificationScoring,
          });
        });
      });

      context('when cleA certification has not been started', function () {
        it('should not save a certif partner', async function () {
          // given
          const userId = 1234;
          const certificationCourseId = 4567;
          complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
            .withArgs({
              certificationCourseId,
              complementaryCertificationName: CLEA,
            })
            .resolves(undefined);

          const event = new CertificationRescoringCompleted({
            certificationCourseId,
            userId,
            isCertification: true,
            reproducibilityRate: 85,
          });

          // when
          await handleCleaCertificationScoring({
            event,
            partnerCertificationScoringRepository,
            badgeRepository,
            knowledgeElementRepository,
            certificationCourseRepository,
            targetProfileRepository,
            badgeCriteriaService,
            complementaryCertificationCourseRepository,
          });

          // then
          expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
        });
      });
    });
  });
});
