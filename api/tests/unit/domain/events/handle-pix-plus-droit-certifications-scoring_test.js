const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handlePixPlusDroitCertificationsScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const { PIX_PLUS_DROIT } = require('../../../../lib/domain/models/ComplementaryCertification');
const { PIX_DROIT_MAITRE_CERTIF } = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Events | handle-pix-plus-droit-certifications-scoring', function () {
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
    complementaryCertificationCourseRepository.getComplementaryCertificationCourseId = sinon.stub();
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handlePixPlusDroitCertificationsScoring)({ event, ...dependencies });

    // then
    expect(error.message).to.equal(
      'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted'
    );
  });

  context('when there is no Pix+ Droit complementary certification', function () {
    it('should not score Pix+ Droit certifications', async function () {
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
            certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
            challengeId: 'chal1',
          }),
        ],
        certificationAnswersByDate: [domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1' })],
      });
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(certificationAssessment);

      complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
        .withArgs({
          certificationCourseId: 123,
          complementaryCertificationName: PIX_PLUS_DROIT,
        })
        .resolves(false);

      // when
      await handlePixPlusDroitCertificationsScoring({ event, ...dependencies });

      // then
      expect(partnerCertificationScoringRepository.save).to.not.have.been.called;
    });
  });

  context('when there is a Pix+ Droit complementary certification', function () {
    it('should score Pix+ Droit certifications', async function () {
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
            certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
            challengeId: 'chal1',
          }),
        ],
        certificationAnswersByDate: [domainBuilder.buildAnswer.ok({ challengeId: 'chal1' })],
      });
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(certificationAssessment);

      complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
        .withArgs({
          certificationCourseId: 123,
          complementaryCertificationName: PIX_PLUS_DROIT,
        })
        .resolves(999);

      assessmentResultRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(domainBuilder.buildAssessmentResult());

      // when
      await handlePixPlusDroitCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: true,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
    });
  });

  it('should only score Pix+ Droit complementary certifications', async function () {
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
          certifiableBadgeKey: 'TOTO',
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
    await handlePixPlusDroitCertificationsScoring({ event, ...dependencies });

    // then
    expect(partnerCertificationScoringRepository.save).to.not.have.been.called;
  });

  context('scoring', function () {
    it('should save a "not acquired" Pix+ Droit certification when pix certification is not validated', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const complementaryCertificationCourseId = 999;
      const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
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
      complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
        .withArgs({
          certificationCourseId: 123,
          complementaryCertificationName: PIX_PLUS_DROIT,
        })
        .resolves(complementaryCertificationCourseId);

      // when
      await handlePixPlusDroitCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        complementaryCertificationCourseId,
        certificationCourseId: 123,
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: false,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });

      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save a "not acquired" Pix+ Droit certification when pix certification is validated and repro rate is not sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
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
      complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
        .withArgs({
          certificationCourseId: 123,
          complementaryCertificationName: PIX_PLUS_DROIT,
        })
        .resolves(999);

      // when
      await handlePixPlusDroitCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 50 }),
        hasAcquiredPixCertification: true,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save an "acquired" Pix+ Droit certification when pix certification is validated and repro rate is sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
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
      complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
        .withArgs({
          certificationCourseId: 123,
          complementaryCertificationName: PIX_PLUS_DROIT,
        })
        .resolves(999);

      // when
      await handlePixPlusDroitCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        certifiableBadgeKey: PIX_DROIT_MAITRE_CERTIF,
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
