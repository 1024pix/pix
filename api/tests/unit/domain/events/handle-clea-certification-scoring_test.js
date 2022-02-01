const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const CertificationRescoringCompleted = require('../../../../lib/domain/events/CertificationRescoringCompleted');
const { handleCleaCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const { CLEA } = require('../../../../lib/domain/models/ComplementaryCertification');
const { featureToggles } = require('../../../../lib/config');

describe('Unit | Domain | Events | handle-clea-certification-scoring', function () {
  let partnerCertificationScoringRepository;
  let certificationCourseRepository;
  let certificationCenterRepository;
  let badgeRepository;
  let knowledgeElementRepository;
  let targetProfileRepository;
  let badgeCriteriaService;
  let complementaryCertificationCourseRepository;
  let cleaCertificationResultRepository;

  beforeEach(function () {
    certificationCenterRepository = {
      getByCertificationCourseId: sinon.stub(),
    };

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

    complementaryCertificationCourseRepository = { hasComplementaryCertification: sinon.stub() };

    cleaCertificationResultRepository = { get: sinon.stub() };
  });

  context('when feature toggle isComplementaryCertificationSubscriptionEnabled is disabled', function () {
    beforeEach(function () {
      sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(false);
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
        expect(error.message).to.not.equal(
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

    context('#handleCleaCertificationRescoring', function () {
      context('when certification center is habilitated', function () {
        context('when CleA certification was not even taken in the first place', function () {
          it('should not build or save no partner certification scoring', async function () {
            // given
            const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
              certificationCourseId: 123,
              userId: 456,
              reproducibilityRate: 80,
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'CléA Numérique',
            });
            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

            cleaCertificationResultRepository.get
              .withArgs({ certificationCourseId: 123 })
              .resolves(domainBuilder.buildCleaCertificationResult.notTaken());

            // when
            await handleCleaCertificationScoring({
              event: certificationRescoringCompletedEvent,
              partnerCertificationScoringRepository,
              cleaCertificationResultRepository,
              certificationCenterRepository,
            });

            // then
            expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).not.to.have.been.called;
            expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
          });
        });

        context('when CleA Certification was taken', function () {
          it('should save the re-scored cleA certification', async function () {
            // given
            const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
              certificationCourseId: 123,
              userId: 456,
              reproducibilityRate: 80,
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'CléA Numérique',
            });
            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

            cleaCertificationResultRepository.get
              .withArgs({ certificationCourseId: 123 })
              .resolves(domainBuilder.buildCleaCertificationResult.acquired());
            const cleaCertificationRescoring = domainBuilder.buildCleaCertificationScoring();
            partnerCertificationScoringRepository.buildCleaCertificationScoring.resolves(cleaCertificationRescoring);
            partnerCertificationScoringRepository.save.resolves();

            // when
            await handleCleaCertificationScoring({
              event: certificationRescoringCompletedEvent,
              partnerCertificationScoringRepository,
              cleaCertificationResultRepository,
              certificationCenterRepository,
            });

            // then
            expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).to.have.been.calledWithExactly({
              certificationCourseId: 123,
              userId: 456,
              reproducibilityRate: 80,
            });
            expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
              partnerCertificationScoring: cleaCertificationRescoring,
            });
          });
        });
      });

      context('when certification center is not habilitated', function () {
        it('should not save the re-scored cleA certification', async function () {
          // given
          const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
            reproducibilityRate: 80,
          });

          const complementaryCertification = domainBuilder.buildComplementaryCertification({
            name: 'Tarte au fromage',
          });
          const certificationCenter = domainBuilder.buildCertificationCenter({
            habilitations: [complementaryCertification],
          });

          certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

          // when
          await handleCleaCertificationScoring({
            event: certificationRescoringCompletedEvent,
            cleaCertificationResultRepository,
            partnerCertificationScoringRepository,
            certificationCenterRepository,
          });

          // then
          expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
        });
      });
    });

    context('#handleCleaCertificationScoring', function () {
      context('when scoring', function () {
        context('when badge is not acquired', function () {
          it('should not save a certif partner', async function () {
            // given
            const userId = 1234;
            const certificationCourseId = 4567;

            const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
              reproducibilityRate: 85,
              hasAcquiredBadge: false,
            });

            const event = new CertificationScoringCompleted({
              certificationCourseId,
              userId,
              isCertification: true,
              reproducibilityRate: 85,
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'CléA Numérique',
            });

            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId
              .withArgs(certificationCourseId)
              .resolves(certificationCenter);

            partnerCertificationScoringRepository.buildCleaCertificationScoring
              .withArgs({
                certificationCourseId,
                userId,
                reproducibilityRate: 85,
              })
              .resolves(cleaCertificationScoring);

            // when
            await handleCleaCertificationScoring({
              event,
              partnerCertificationScoringRepository,
              badgeRepository,
              knowledgeElementRepository,
              certificationCenterRepository,
              certificationCourseRepository,
              targetProfileRepository,
              badgeCriteriaService,
            });

            // then
            expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
          });
        });
        context('when certification is eligible', function () {
          it('should save a certif partner', async function () {
            // given
            const userId = 1234;
            const certificationCourseId = 4567;
            const knowledgeElements = [
              domainBuilder.buildKnowledgeElement({ userId }),
              domainBuilder.buildKnowledgeElement({ userId }),
            ];
            const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
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

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'CléA Numérique',
            });

            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId
              .withArgs(certificationCourseId)
              .resolves(certificationCenter);

            partnerCertificationScoringRepository.buildCleaCertificationScoring
              .withArgs({
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

            // when
            await handleCleaCertificationScoring({
              event,
              partnerCertificationScoringRepository,
              badgeRepository,
              knowledgeElementRepository,
              certificationCourseRepository,
              certificationCenterRepository,
              targetProfileRepository,
              badgeCriteriaService,
            });

            // then
            expect(partnerCertificationScoringRepository.save).to.have.been.calledWithMatch({
              partnerCertificationScoring: cleaCertificationScoring,
            });
          });
        });

        context('when certification is not eligible', function () {
          it('should not save a certif partner', async function () {
            // given
            const userId = 1234;
            const certificationCourseId = 4567;
            const knowledgeElements = [
              domainBuilder.buildKnowledgeElement({ userId }),
              domainBuilder.buildKnowledgeElement({ userId }),
            ];
            const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
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

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'CléA Numérique',
            });

            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId
              .withArgs(certificationCourseId)
              .resolves(certificationCenter);

            partnerCertificationScoringRepository.buildCleaCertificationScoring
              .withArgs({
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
              .returns(false);

            // when
            await handleCleaCertificationScoring({
              event,
              partnerCertificationScoringRepository,
              badgeRepository,
              knowledgeElementRepository,
              certificationCourseRepository,
              certificationCenterRepository,
              targetProfileRepository,
              badgeCriteriaService,
            });

            // then
            expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
          });
        });

        context('when certification center is not habilitated', function () {
          it('should not save a certif partner', async function () {
            // given
            const userId = 1234;
            const certificationCourseId = 4567;

            const event = new CertificationScoringCompleted({
              certificationCourseId,
              userId,
              isCertification: true,
              reproducibilityRate: 85,
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'Tarte au fromage',
            });

            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId
              .withArgs(certificationCourseId)
              .resolves(certificationCenter);

            // when
            await handleCleaCertificationScoring({
              event,
              partnerCertificationScoringRepository,
              badgeRepository,
              knowledgeElementRepository,
              certificationCourseRepository,
              certificationCenterRepository,
              targetProfileRepository,
              badgeCriteriaService,
            });

            // then
            expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
          });
        });
      });

      context('when rescoring', function () {
        context('when CleA certification was not even taken in the first place', function () {
          it('should not build or save no partner certification scoring', async function () {
            // given
            const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
              certificationCourseId: 123,
              userId: 456,
              reproducibilityRate: 80,
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'CléA Numérique',
            });
            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

            cleaCertificationResultRepository.get
              .withArgs({ certificationCourseId: 123 })
              .resolves(domainBuilder.buildCleaCertificationResult.notTaken());

            // when
            await handleCleaCertificationScoring({
              event: certificationRescoringCompletedEvent,
              partnerCertificationScoringRepository,
              cleaCertificationResultRepository,
              certificationCenterRepository,
            });

            // then
            expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).not.to.have.been.called;
            expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
          });
        });

        context('when CleA Certification was taken', function () {
          it('should save the re-scored cleA certification', async function () {
            // given
            const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
              certificationCourseId: 123,
              userId: 456,
              reproducibilityRate: 80,
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'CléA Numérique',
            });
            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

            cleaCertificationResultRepository.get
              .withArgs({ certificationCourseId: 123 })
              .resolves(domainBuilder.buildCleaCertificationResult.acquired());
            const cleaCertificationRescoring = domainBuilder.buildCleaCertificationScoring();
            partnerCertificationScoringRepository.buildCleaCertificationScoring.resolves(cleaCertificationRescoring);
            partnerCertificationScoringRepository.save.resolves();

            // when
            await handleCleaCertificationScoring({
              event: certificationRescoringCompletedEvent,
              partnerCertificationScoringRepository,
              cleaCertificationResultRepository,
              certificationCenterRepository,
            });

            // then
            expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).to.have.been.calledWithExactly({
              certificationCourseId: 123,
              userId: 456,
              reproducibilityRate: 80,
            });
            expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
              partnerCertificationScoring: cleaCertificationRescoring,
            });
          });
        });

        context('when certification center is not habilited', function () {
          it('should not save the re-scored cleA certification', async function () {
            // given
            const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
              certificationCourseId: 123,
              userId: 456,
              reproducibilityRate: 80,
            });

            const complementaryCertification = domainBuilder.buildComplementaryCertification({
              name: 'Tarte au fromage',
            });
            const certificationCenter = domainBuilder.buildCertificationCenter({
              habilitations: [complementaryCertification],
            });

            certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

            // when
            await handleCleaCertificationScoring({
              event: certificationRescoringCompletedEvent,
              cleaCertificationResultRepository,
              partnerCertificationScoringRepository,
              certificationCenterRepository,
            });

            // then
            expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
          });
        });
      });
    });
  });

  context('when feature toggle isComplementaryCertificationSubscriptionEnabled is enabled', function () {
    beforeEach(function () {
      sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(true);
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
            const knowledgeElements = [
              domainBuilder.buildKnowledgeElement({ userId }),
              domainBuilder.buildKnowledgeElement({ userId }),
            ];
            const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
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

            complementaryCertificationCourseRepository.hasComplementaryCertification
              .withArgs({
                certificationCourseId,
                complementaryCertificationName: CLEA,
              })
              .resolves(true);

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
            complementaryCertificationCourseRepository.hasComplementaryCertification
              .withArgs({
                certificationCourseId,
                complementaryCertificationName: CLEA,
              })
              .resolves(false);

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
            const knowledgeElements = [
              domainBuilder.buildKnowledgeElement({ userId }),
              domainBuilder.buildKnowledgeElement({ userId }),
            ];
            const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring({
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

            complementaryCertificationCourseRepository.hasComplementaryCertification
              .withArgs({
                certificationCourseId,
                complementaryCertificationName: CLEA,
              })
              .resolves(true);

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
            complementaryCertificationCourseRepository.hasComplementaryCertification
              .withArgs({
                certificationCourseId,
                complementaryCertificationName: CLEA,
              })
              .resolves(false);

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
});
