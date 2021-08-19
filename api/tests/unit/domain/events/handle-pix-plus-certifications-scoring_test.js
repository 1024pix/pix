const _ = require('lodash');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handlePixPlusCertificationsScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-pix-plus-certifications-scoring', function() {

  const certificationAssessmentRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    getByCertificationCourseId: _.noop(),
  };
  const partnerCertificationScoringRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    save: _.noop(),
  };
  const assessmentResultRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    getByCertificationCourseId: _.noop(),
  };
  const dependencies = {
    certificationAssessmentRepository,
    partnerCertificationScoringRepository,
    assessmentResultRepository,
  };

  beforeEach(function() {
    partnerCertificationScoringRepository.save = sinon.stub();
    certificationAssessmentRepository.getByCertificationCourseId = sinon.stub();
    assessmentResultRepository.getByCertificationCourseId = sinon.stub();
  });

  it('fails when event is not of correct type', async function() {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handlePixPlusCertificationsScoring)(
      { event, ...dependencies },
    );

    // then
    expect(error.message).to.equal('event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted');
  });

  context('when user was not asked any pix plus challenges', function() {

    it('should save no pix plus certifications', async function() {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        certificationChallenges: [domainBuilder.buildCertificationChallengeWithType({ certifiableBadgeKey: null, challengeId: 'chal1' })],
        certificationAnswersByDate: [domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1' })],
      });
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: 123 })
        .resolves(certificationAssessment);

      // when
      await handlePixPlusCertificationsScoring({ event, ...dependencies });

      // then
      expect(partnerCertificationScoringRepository.save).to.not.have.been.called;
    });
  });

  context('when user has answered some pix plus challenges', function() {

    it('should save as many pix plus certifications as there are certifiable badges evaluted during the certification test', async function() {
      // given
      const event = domainBuilder.buildCertificationScoringCompletedEvent({
        certificationCourseId: 123,
        userId: 456,
      });
      const certificationChallengeMangue = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1', certifiableBadgeKey: 'BADGE_MANGUE' });
      const certificationChallengePasteque = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal2', certifiableBadgeKey: 'BADGE_PASTEQUE' });
      const certificationAnswerMangue = domainBuilder.buildAnswer({ challengeId: 'chal1' });
      const certificationAnswerPasteque = domainBuilder.buildAnswer({ challengeId: 'chal2' });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        certificationChallenges: [certificationChallengeMangue, certificationChallengePasteque],
        certificationAnswersByDate: [certificationAnswerMangue, certificationAnswerPasteque],
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
      expect(partnerCertificationScoringRepository.save.callCount).to.equal(2);
    });

    context('scoring', function() {

      it('should save a not acquired pix plus certification when pix certification is not validated', async function() {
        // given
        const event = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
        });
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1', certifiableBadgeKey: 'BADGE_MANGUE' });
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

        // when
        await handlePixPlusCertificationsScoring({ event, ...dependencies });

        // then
        const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
          certificationCourseId: 123,
          certifiableBadgeKey: 'BADGE_MANGUE',
          reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
          hasAcquiredPixCertification: false,
        });
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({ partnerCertificationScoring: expectedPartnerCertificationScoring });
      });

      it('should save a not acquired pix plus certification when pix certification is validated and repro rate is not sufficient', async function() {
        // given
        const event = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
        });
        const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1', certifiableBadgeKey: 'BADGE_MANGUE' });
        const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal2', certifiableBadgeKey: 'BADGE_MANGUE' });
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
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({ partnerCertificationScoring: expectedPartnerCertificationScoring });
      });

      it('should save an acquired pix plus certification when pix certification is validated and repro rate is sufficient', async function() {
        // given
        const event = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
        });
        const certificationChallenge1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal1', certifiableBadgeKey: 'BADGE_MANGUE' });
        const certificationChallenge2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'chal2', certifiableBadgeKey: 'BADGE_MANGUE' });
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

        // when
        await handlePixPlusCertificationsScoring({ event, ...dependencies });

        // then
        const expectedPartnerCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
          certificationCourseId: 123,
          certifiableBadgeKey: 'BADGE_MANGUE',
          reproducibilityRate: domainBuilder.buildReproducibilityRate({ value: 100 }),
          hasAcquiredPixCertification: true,
        });
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({ partnerCertificationScoring: expectedPartnerCertificationScoring });
      });
    });
  });
});
