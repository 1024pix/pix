import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';
import { catchErr, expect, sinon, domainBuilder } from '../../../test-helper.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
const { handleComplementaryCertificationsScoring } = _forTestOnly.handlers;

describe('Unit | Domain | Events | handle-complementary-certification-certifications-scoring', function () {
  const certificationAssessmentRepository = {};
  const complementaryCertificationCourseResultRepository = {};
  const assessmentResultRepository = {};
  const complementaryCertificationScoringCriteriaRepository = {};

  const dependencies = {
    certificationAssessmentRepository,
    complementaryCertificationCourseResultRepository,
    assessmentResultRepository,
    complementaryCertificationScoringCriteriaRepository,
  };

  beforeEach(function () {
    complementaryCertificationCourseResultRepository.save = sinon.stub();
    certificationAssessmentRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.getByCertificationCourseId = sinon.stub();
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId = sinon.stub();
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handleComplementaryCertificationsScoring)({ event, ...dependencies });

    // then
    expect(error.message).to.equal(
      'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted',
    );
  });

  context('when there is no complementary certification', function () {
    it('should not score certifications', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });

      complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves([]);

      // when
      await handleComplementaryCertificationsScoring({ event, ...dependencies });

      // then
      expect(complementaryCertificationCourseResultRepository.save).to.not.have.been.called;
    });
  });

  context('when there is a complementary certification', function () {
    context('when there is a complementary referential', function () {
      it('should score the complementary certification', async function () {
        // given
        const event = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
        });

        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 123,
          userId: 456,
          createdAt: new Date('2020-01-01'),
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({
              certifiableBadgeKey: 'PIX_PLUS_TEST',
              challengeId: 'chal1',
            }),
          ],
          certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
        });

        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId: 123,
          })
          .resolves([
            domainBuilder.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 70,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              hasComplementaryReferential: true,
            }),
          ]);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(certificationAssessment);

        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildAssessmentResult());

        // when
        await handleComplementaryCertificationsScoring({ event, ...dependencies });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            partnerKey: 'PIX_PLUS_TEST',
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: true,
          }),
        );
      });

      context('scoring', function () {
        it('should save a "not acquired" complementary certification when pix certification is not validated', async function () {
          // given
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(domainBuilder.buildAssessmentResult.rejected());
          const complementaryCertificationScoringCriteria = [
            domainBuilder.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 100,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              hasComplementaryReferential: true,
            }),
          ];
          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves(complementaryCertificationScoringCriteria);

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              partnerKey: 'PIX_PLUS_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: false,
            }),
          );
        });

        it('should save a "not acquired" complementary certification when pix certification is validated and repro rate is not sufficient', async function () {
          // given
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal2',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer1 = domainBuilder.buildAnswer.ko({ challengeId: 'chal1' });
          const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 75,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: true,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(domainBuilder.buildAssessmentResult.validated());

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

          // then

          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              partnerKey: 'PIX_PLUS_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: false,
            }),
          );
        });

        it('should save an "acquired" complementary certification when pix certification is validated and repro rate is sufficient', async function () {
          // given
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal2',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer1 = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
          const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 75,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: true,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(domainBuilder.buildAssessmentResult.validated());

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

          // then

          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              partnerKey: 'PIX_PLUS_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: true,
            }),
          );
        });
      });
    });

    context('when there is no complementary referential', function () {
      it('should score the complementary certification', async function () {
        // given
        const event = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
        });

        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 123,
          userId: 456,
          createdAt: new Date('2020-01-01'),
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({
              certifiableBadgeKey: 'PIX_PLUS_TEST',
              challengeId: 'chal1',
            }),
          ],
          certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
        });

        complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
          .withArgs({
            certificationCourseId: 123,
          })
          .resolves([
            domainBuilder.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 70,
              minimumEarnedPix: 50,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              hasComplementaryReferential: false,
            }),
          ]);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(certificationAssessment);

        assessmentResultRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildAssessmentResult({ pixScore: 128, reproducibilityRate: 100 }));

        // when
        await handleComplementaryCertificationsScoring({ event, ...dependencies });

        // then

        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
          ComplementaryCertificationCourseResult.from({
            complementaryCertificationCourseId: 999,
            complementaryCertificationBadgeId: 888,
            partnerKey: 'PIX_PLUS_TEST',
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: true,
          }),
        );
      });

      context('scoring', function () {
        it('should save a "not acquired" complementary certification when pix score and reproducibility rate are below expectations', async function () {
          // given
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 45,
              reproducibilityRate: 70,
            }),
          );
          const complementaryCertificationScoringCriteria = [
            domainBuilder.buildComplementaryCertificationScoringCriteria({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              minimumReproducibilityRate: 75,
              complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
              hasComplementaryReferential: false,
              minimumEarnedPix: 50,
            }),
          ];
          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves(complementaryCertificationScoringCriteria);

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              partnerKey: 'PIX_PLUS_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: false,
            }),
          );
        });

        it('should save a "not acquired" complementary certification when pix score is above expectation and repro rate is not', async function () {
          // given
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal2',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer1 = domainBuilder.buildAnswer.ko({ challengeId: 'chal1' });
          const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 75,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: false,
                minimumEarnedPix: 50,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 60,
              reproducibilityRate: 70,
            }),
          );

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              partnerKey: 'PIX_PLUS_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: false,
            }),
          );
        });

        it('should save a "not acquired" complementary certification when pix score is below expectation and repro rate is above', async function () {
          // given
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal2',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer1 = domainBuilder.buildAnswer.ko({ challengeId: 'chal1' });
          const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 70,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: false,
                minimumEarnedPix: 50,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 45,
              reproducibilityRate: 75,
            }),
          );

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              partnerKey: 'PIX_PLUS_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: false,
            }),
          );
        });

        it('should save an "acquired" complementary certification when pix score and repro rate are above expectations', async function () {
          // given
          const event = domainBuilder.buildCertificationScoringCompletedEvent({
            certificationCourseId: 123,
            userId: 456,
          });
          const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal1',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'chal2',
            certifiableBadgeKey: 'PIX_PLUS_TEST',
          });
          const certificationAnswer1 = domainBuilder.buildAnswer.ok({ challengeId: 'chal1' });
          const certificationAnswer2 = domainBuilder.buildAnswer.ok({ challengeId: 'chal2' });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationCourseId: 123,
            userId: 456,
            createdAt: new Date('2020-01-01'),
            certificationChallenges: [certificationChallenge1, certificationChallenge2],
            certificationAnswersByDate: [certificationAnswer1, certificationAnswer2],
          });

          complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
            .withArgs({
              certificationCourseId: 123,
            })
            .resolves([
              domainBuilder.buildComplementaryCertificationScoringCriteria({
                complementaryCertificationCourseId: 999,
                complementaryCertificationBadgeId: 888,
                minimumReproducibilityRate: 70,
                complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
                hasComplementaryReferential: false,
                minimumEarnedPix: 50,
              }),
            ]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: 123 })
            .resolves(certificationAssessment);
          assessmentResultRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(
            domainBuilder.buildAssessmentResult.validated({
              pixScore: 120,
              reproducibilityRate: 75,
            }),
          );

          // when
          await handleComplementaryCertificationsScoring({ event, ...dependencies });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            ComplementaryCertificationCourseResult.from({
              complementaryCertificationCourseId: 999,
              complementaryCertificationBadgeId: 888,
              partnerKey: 'PIX_PLUS_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: true,
            }),
          );
        });
      });
    });
  });
});
