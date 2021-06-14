const { expect, domainBuilder, sinon } = require('../../../test-helper');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const CertificationIssueReportResolutionAttempt = require('../../../../lib/domain/models/CertificationIssueReportResolutionAttempt');
const {
  NEUTRALIZE_WITHOUT_CHECKING: neutralizeWithoutChecking,
  NEUTRALIZE_IF_IMAGE: neutralizeIfImage,
  NEUTRALIZE_IF_EMBED: neutralizeIfEmbed,
  NEUTRALIZE_IF_ATTACHMENT: neutralizeIfAttachment,
  NONE: doNotResolve,
} = require('../../../../lib/domain/models/CertificationIssueReportResolutionStrategies');

describe('Unit | Domain | Models | CertificationIssueReportResolutionStrategies', () => {

  context('#NEUTRALIZE_WITHOUT_CHECKING', () => {

    context('When challenge is neutralizable', () => {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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

      it('returns a successful resolution without effect', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_IMAGE', () => {

    context('When challenge is neutralizable', () => {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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
        await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', () => {

      it('returns a successful resolution without effect', async () => {
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
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an image', () => {

      it('returns a successful resolution without effect', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutIllustration = domainBuilder.buildChallenge({ illustrationUrl: null });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutIllustration),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutIllustration = domainBuilder.buildChallenge({ illustrationUrl: null });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutIllustration),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeIfImage({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', () => {

      it('returns a successful resolution attempt without effect', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_EMBED', () => {

    context('When challenge is neutralizable', () => {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithEmbed = domainBuilder.buildChallenge({ embedUrl: 'embed_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithEmbed),
        };

        // when
        const neutralizationAttempt = await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
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

        const challengeWithEmbed = domainBuilder.buildChallenge({ embedUrl: 'embed_url' });

        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithEmbed),
        };

        // when
        await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', () => {

      it('returns a successful resolution attempt without effect', async () => {
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
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an embed', () => {

      it('returns a successful resolution without effect', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutEmbed = domainBuilder.buildChallenge({ embedUrl: null });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutEmbed),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.resolution).to.equal('Cette question n\' a pas été neutralisée car elle ne contient pas d\'application/simulateur');
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutEmbed = domainBuilder.buildChallenge({ embedUrl: null });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutEmbed),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', () => {

      it('returns a successful resolution without effect', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithEmbed = domainBuilder.buildChallenge({ embedUrl: 'embed_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithEmbed),
        };

        // when
        const neutralizationAttempt = await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithEmbed = domainBuilder.buildChallenge({ embedUrl: 'embed_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithEmbed),
        };

        // when
        await neutralizeIfEmbed({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_ATTACHMENT', () => {

    context('When challenge is neutralizable', () => {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        const neutralizationAttempt = await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });

        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });

        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', () => {

      it('returns a successful resolution attempt without effect', async () => {
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
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an attachment', () => {

      it('returns a successful resolution without effect', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutAttachment = domainBuilder.buildChallenge({ attachments: [] });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutAttachment),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutAttachment = domainBuilder.buildChallenge({ attachments: [] });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutAttachment),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', () => {

      it('returns a successful resolution without effect', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        const neutralizationAttempt = await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async () => {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        await neutralizeIfAttachment({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NONE', () => {
    it('returns an unresolved resolution attempt', async () => {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        questionNumber: 1,
      });

      // when
      const resolutionAttempt = await doNotResolve({ certificationIssueReport, certificationAssessment: null, certificationIssueReportRepository: null, challengeRepository: null });

      // then
      expect(resolutionAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.unresolved());
    });

    it('does not resolve the certification issue report', async () => {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        questionNumber: 1,
      });

      // when
      await doNotResolve({ certificationIssueReport, certificationAssessment: null, certificationIssueReportRepository: null, challengeRepository: null });

      // then
      expect(certificationIssueReport.isResolved()).to.be.false;
    });
  });
});
