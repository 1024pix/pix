const { expect, domainBuilder, sinon } = require('../../../test-helper');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const CertificationIssueReportResolutionAttempt = require('../../../../lib/domain/models/CertificationIssueReportResolutionAttempt');
const {
  NEUTRALIZE_WITHOUT_CHECKING: neutralizeWithoutChecking,
  NEUTRALIZE_IF_IMAGE: neutralizeIfImage,
} = require('../../../../lib/domain/models/CertificationIssueReportResolutionStrategies');

describe('Unit | Domain | Models | CertificationIssueReportResolutionStrategies', () => {

  context('#NEUTRALIZE_WITHOUT_CHECKING', () => {

    context('When challenge is neutralizable', () => {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        const neutralizationAttempt = await neutralizeWithoutChecking({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.succeeded());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        await neutralizeWithoutChecking({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', () => {

      it('returns a failed neutralization attempt', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        const neutralizationAttempt = await neutralizeWithoutChecking({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.failure());
      });

      it('does not resolve the certification issue report', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        await neutralizeWithoutChecking({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.false;
      });
    });
  });

  context('#NEUTRALIZE_IF_IMAGE', () => {

    context('When challenge is neutralizable', () => {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithImage = domainBuilder.buildChallenge({ illustrationUrl: 'image_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithImage),
        };

        // when
        const neutralizationAttempt = await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.succeeded());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        await neutralizeWithoutChecking({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', () => {

      it('returns a failed neutralization attempt', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallenge()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.failure());
      });
    });

    context('the challenge does not contain an image', () => {

      it('returns a failed neutralization attempt', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutImage = domainBuilder.buildChallenge({ illustrationUrl: null });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutImage),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallenge();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.failure());
      });
    });

    context('When challenge is not neutralizable', () => {

      it('returns a failed neutralization attempt', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithImage = domainBuilder.buildChallenge({ illustrationUrl: 'image_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithImage),
        };

        // when
        const neutralizationAttempt = await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.failure());
      });

      it('does not resolve the certification issue report', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallenge({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithImage = domainBuilder.buildChallenge({ illustrationUrl: 'image_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithImage),
        };

        // when
        await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.false;
      });
    });
  });
});
