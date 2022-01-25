const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handlePixPlusCertificationsScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const { PIX_PLUS_DROIT } = require('../../../../lib/domain/models/ComplementaryCertification');
const { PIX_DROIT_MAITRE_CERTIF, PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME } =
  require('../../../../lib/domain/models/Badge').keys;
const { featureToggles } = require('../../../../lib/config');

describe('Unit | Domain | Events | handle-pix-plus-certifications-scoring', function () {
  const certificationAssessmentRepository = {};
  const partnerCertificationScoringRepository = {};
  const assessmentResultRepository = {};
  const complementaryCertificationCourseRepository = {};

  const dependencies = {
    certificationAssessmentRepository,
    partnerCertificationScoringRepository,
    assessmentResultRepository,
    complementaryCertificationCourseRepository,
  };

  beforeEach(function () {
    partnerCertificationScoringRepository.save = sinon.stub();
    certificationAssessmentRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.getByCertificationCourseId = sinon.stub();
    complementaryCertificationCourseRepository.hasComplementaryCertification = sinon.stub();
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

  it('should score Pix+ Droit certifications when feature toggle is disabled', async function () {
    // given
    sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(false);
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
          certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
          challengeId: 'chal1',
        }),
      ],
      certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
    });
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
      certificationCourseId: 123,
      certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
      reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
      hasAcquiredPixCertification: true,
    });
    expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
      partnerCertificationScoring: expectedPartnerCertificationScoring,
    });
  });

  it('should not score Pix+ Droit certifications when feature toggle is enabled and there is no Pix+ Droit complementary certification', async function () {
    // given
    sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(true);
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
          certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
          challengeId: 'chal1',
        }),
      ],
      certificationAnswersByDate: [domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1' })],
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: 123 })
      .resolves(certificationAssessment);

    complementaryCertificationCourseRepository.hasComplementaryCertification
      .withArgs({
        certificationCourseId: 123,
        complementaryCertificationName: PIX_PLUS_DROIT,
      })
      .resolves(false);

    // when
    await handlePixPlusCertificationsScoring({ event, ...dependencies });

    // then
    expect(partnerCertificationScoringRepository.save).to.not.have.been.called;
  });

  it('should score Pix+ Droit certifications when feature toggle is enabled and there is a Pix+ Droit complementary certification', async function () {
    // given
    sinon.stub(featureToggles, 'isComplementaryCertificationSubscriptionEnabled').value(true);
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
          certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
          challengeId: 'chal1',
        }),
      ],
      certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: 123 })
      .resolves(certificationAssessment);

    complementaryCertificationCourseRepository.hasComplementaryCertification
      .withArgs({
        certificationCourseId: 123,
        complementaryCertificationName: PIX_PLUS_DROIT,
      })
      .resolves(true);

    assessmentResultRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: 123 })
      .resolves(domainBuilder.buildAssessmentResult());

    // when
    await handlePixPlusCertificationsScoring({ event, ...dependencies });

    // then
    const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
      certificationCourseId: 123,
      certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
      reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
      hasAcquiredPixCertification: true,
    });
    expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
      partnerCertificationScoring: expectedPartnerCertificationScoring,
    });
  });

  it('should score Pix+ Édu certifications', async function () {
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
          certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          challengeId: 'chal1',
        }),
      ],
      certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
    });
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
      certificationCourseId: 123,
      certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
      hasAcquiredPixCertification: true,
    });
    expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
      partnerCertificationScoring: expectedPartnerCertificationScoring,
    });
  });

  context('scoring', function () {
    it('should save a "not acquired" pix plus certification when pix certification is not validated', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: 'BADGE_MANGUE',
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
      complementaryCertificationCourseRepository.hasComplementaryCertification
        .withArgs({
          certificationCourseId: 123,
          complementaryCertificationName: PIX_PLUS_DROIT,
        })
        .resolves(true);

      // when
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        certificationCourseId: 123,
        certifiableBadgeKey: 'BADGE_MANGUE',
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: false,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });

      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save a "not acquired" pix plus certification when pix certification is validated and repro rate is not sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: 'BADGE_MANGUE',
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: 'BADGE_MANGUE',
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
        certificationCourseId: 123,
        certifiableBadgeKey: 'BADGE_MANGUE',
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 50 }),
        hasAcquiredPixCertification: true,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save an "acquired" pix plus certification when pix certification is validated and repro rate is sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: 'BADGE_MANGUE',
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: 'BADGE_MANGUE',
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
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(certificationAssessment);
      assessmentResultRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(domainBuilder.buildAssessmentResult.validated());
      complementaryCertificationCourseRepository.hasComplementaryCertification
        .withArgs({
          certificationCourseId: 123,
          complementaryCertificationName: PIX_PLUS_DROIT,
        })
        .resolves(true);

      // when
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        certificationCourseId: 123,
        certifiableBadgeKey: 'BADGE_MANGUE',
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: true,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.true;
    });
  });
});
