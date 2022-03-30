const { PIX_PLUS_EDU } = require('../../../../lib/domain/models/ComplementaryCertification');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handlePixPlusEduCertificationsScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const { PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME } = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Events | handle-pix-plus-edu-certifications-scoring', function () {
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
    const error = await catchErr(handlePixPlusEduCertificationsScoring)({ event, ...dependencies });

    // then
    expect(error.message).to.equal(
      'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted'
    );
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

    complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
      .withArgs({
        certificationCourseId: 123,
        complementaryCertificationName: PIX_PLUS_EDU,
      })
      .resolves(999);

    // when
    await handlePixPlusEduCertificationsScoring({ event, ...dependencies });

    // then
    const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
      complementaryCertificationCourseId: 999,
      certificationCourseId: 123,
      certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
      hasAcquiredPixCertification: true,
    });
    expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
      partnerCertificationScoring: expectedPartnerCertificationScoring,
    });
  });

  it('should only score Pix+ Edu certifications', async function () {
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
      certificationAnswersByDate: [domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1' })],
    });
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: 123 })
      .resolves(certificationAssessment);
    complementaryCertificationCourseRepository.getComplementaryCertificationCourseId
      .withArgs({
        certificationCourseId: 123,
        complementaryCertificationName: PIX_PLUS_EDU,
      })
      .resolves(999);

    // when
    await handlePixPlusEduCertificationsScoring({ event, ...dependencies });

    // then
    expect(partnerCertificationScoringRepository.save).to.not.have.been.called;
  });

  context('scoring', function () {
    it('should save a "not acquired" Pix+ Edu certification when pix certification is not validated', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
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
          complementaryCertificationName: PIX_PLUS_EDU,
        })
        .resolves(999);

      // when
      await handlePixPlusEduCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: false,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });

      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save a "not acquired" Pix+ Edu certification when pix certification is validated and repro rate is not sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
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
          complementaryCertificationName: PIX_PLUS_EDU,
        })
        .resolves(999);

      // when
      await handlePixPlusEduCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 50 }),
        hasAcquiredPixCertification: true,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save an "acquired" Pix+ Edu certification when pix certification is validated and repro rate is sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
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
          complementaryCertificationName: PIX_PLUS_EDU,
        })
        .resolves(999);

      // when
      await handlePixPlusEduCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
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
