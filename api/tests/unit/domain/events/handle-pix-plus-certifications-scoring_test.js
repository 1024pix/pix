const { ReproducibilityRate } = require('../../../../lib/domain/models/ReproducibilityRate');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handlePixPlusCertificationsScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pix-plus-certifications-scoring', function () {
  const certificationAssessmentRepository = {};
  const partnerCertificationScoringRepository = {};
  const assessmentResultRepository = {};
  const complementaryCertificationScoringCriteriaRepository = {};

  const dependencies = {
    certificationAssessmentRepository,
    partnerCertificationScoringRepository,
    assessmentResultRepository,
    complementaryCertificationScoringCriteriaRepository,
  };

  beforeEach(function () {
    partnerCertificationScoringRepository.save = sinon.stub();
    certificationAssessmentRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.getByCertificationCourseId = sinon.stub();
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId = sinon.stub();
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handlePixPlusCertificationsScoring)({ event, ...dependencies });

    // then
    expect(error.message).to.equal(
      'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted'
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
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      expect(partnerCertificationScoringRepository.save).to.not.have.been.called;
    });
  });

  context('when there is a complementary certification', function () {
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
            minimumReproducibilityRate: 70,
            complementaryCertificationBadgeKeys: ['PIX_PLUS_TEST'],
          }),
        ]);

      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(certificationAssessment);

      assessmentResultRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(domainBuilder.buildAssessmentResult());

      // when
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        complementaryCertificationCourseId: 999,
        certifiableBadgeKey: 'PIX_PLUS_TEST',
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: true,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
    });
  });

  context('scoring', function () {
    it('should save a "not acquired" complementary certification when pix certification is not validated', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const complementaryCertificationCourseId = 999;
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
          minimumReproducibilityRate: 100,
          complementaryCertificationBadgeKeys: ['PIX_PLUS_TEST'],
        }),
      ];
      complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
        .withArgs({
          certificationCourseId: 123,
        })
        .resolves(complementaryCertificationScoringCriteria);

      // when
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        complementaryCertificationCourseId,
        certifiableBadgeKey: 'PIX_PLUS_TEST',
        source: 'PIX',
        reproducibilityRate: new ReproducibilityRate(100),
        hasAcquiredPixCertification: false,
        minimumReproducibilityRate: 100,
      });

      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });

      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
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
            minimumReproducibilityRate: 75,
            complementaryCertificationBadgeKeys: ['PIX_PLUS_TEST'],
          }),
        ]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(certificationAssessment);
      assessmentResultRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(domainBuilder.buildAssessmentResult.validated());

      // when
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        complementaryCertificationCourseId: 999,
        certifiableBadgeKey: 'PIX_PLUS_TEST',
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 50 }),
        hasAcquiredPixCertification: true,
        minimumReproducibilityRate: 75,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
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
            minimumReproducibilityRate: 75,
            complementaryCertificationBadgeKeys: ['PIX_PLUS_TEST'],
          }),
        ]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(certificationAssessment);
      assessmentResultRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(domainBuilder.buildAssessmentResult.validated());

      // when
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        complementaryCertificationCourseId: 999,
        certifiableBadgeKey: 'PIX_PLUS_TEST',
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: true,
        minimumReproducibilityRate: 75,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.true;
    });
  });
});
