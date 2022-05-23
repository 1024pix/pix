const { PIX_PLUS_EDU_1ER_DEGRE } = require('../../../../lib/domain/models/ComplementaryCertification');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handlePixPlusEdu1erDegreCertificationsScoring } = require('../../../../lib/domain/events')._forTestOnly
  .handlers;
const {
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Events | handle-pix-plus-edu-1er-degre-certifications-scoring', function () {
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
    const error = await catchErr(handlePixPlusEdu1erDegreCertificationsScoring)({ event, ...dependencies });

    // then
    expect(error.message).to.equal(
      'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted'
    );
  });
  describe('when the assessment has a Pix+ Edu 1er degre challenge', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    ].forEach((certifiableBadgeKey) => {
      it(`should score Pix+ Édu certification for badge ${certifiableBadgeKey}`, async function () {
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
              certifiableBadgeKey,
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
            complementaryCertificationName: PIX_PLUS_EDU_1ER_DEGRE,
          })
          .resolves(999);

        // when
        await handlePixPlusEdu1erDegreCertificationsScoring({ event, ...dependencies });

        // then
        const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
          complementaryCertificationCourseId: 999,
          certifiableBadgeKey,
          reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
          hasAcquiredPixCertification: true,
        });
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
          partnerCertificationScoring: expectedPartnerCertificationScoring,
        });
      });
    });
  });

  describe('when the assessment has no Pix+ Edu 1er degre challenge', function () {
    it('should not score Pix+ Edu 1er degre certifications', async function () {
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
          complementaryCertificationName: PIX_PLUS_EDU_1ER_DEGRE,
        })
        .resolves(999);

      // when
      await handlePixPlusEdu1erDegreCertificationsScoring({ event, ...dependencies });

      // then
      expect(partnerCertificationScoringRepository.save).to.not.have.been.called;
    });
  });

  context('scoring', function () {
    it('should save a "not acquired" Pix+ Edu 1er degre certification when pix certification is not validated', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
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
          complementaryCertificationName: PIX_PLUS_EDU_1ER_DEGRE,
        })
        .resolves(999);

      // when
      await handlePixPlusEdu1erDegreCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        complementaryCertificationCourseId: 999,
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
        hasAcquiredPixCertification: false,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });

      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save a "not acquired" Pix+ Edu 1er degre certification when pix certification is validated and repro rate is not sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
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
          complementaryCertificationName: PIX_PLUS_EDU_1ER_DEGRE,
        })
        .resolves(999);

      // when
      await handlePixPlusEdu1erDegreCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        complementaryCertificationCourseId: 999,
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 50 }),
        hasAcquiredPixCertification: true,
      });
      expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
        partnerCertificationScoring: expectedPartnerCertificationScoring,
      });
      expect(expectedPartnerCertificationScoring.isAcquired()).to.be.false;
    });

    it('should save an "acquired" Pix+ Edu 1er degre certification when pix certification is validated and repro rate is sufficient', async function () {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal1',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      });
      const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'chal2',
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
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
          complementaryCertificationName: PIX_PLUS_EDU_1ER_DEGRE,
        })
        .resolves(999);

      // when
      await handlePixPlusEdu1erDegreCertificationsScoring({ event, ...dependencies });

      // then
      const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        complementaryCertificationCourseId: 999,
        certifiableBadgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
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
