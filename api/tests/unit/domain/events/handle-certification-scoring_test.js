const _ = require('lodash');
const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { handleCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { CertificationComputeError } = require('../../../../lib/domain/errors');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

describe('Unit | Domain | Events | handle-certification-scoring', () => {
  const scoringCertificationService = { calculateCertificationAssessmentScore: _.noop };
  const certificationAssessmentRepository = { get: _.noop };
  const assessmentResultRepository = { save: _.noop };
  const certificationCourseRepository = { changeCompletionDate: _.noop, getCreationDate: _.noop };
  const competenceMarkRepository = { save: _.noop };
  const domainTransaction = {};
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;
  let event;

  const dependencies = {
    assessmentResultRepository,
    certificationCourseRepository,
    competenceMarkRepository,
    scoringCertificationService,
    certificationAssessmentRepository,
  };

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(() => {
    clock.restore();
  });

  context('when assessment is of type CERTIFICATION', () => {
    const assessmentId = Symbol('assessmentId');
    const userId = Symbol('userId');
    let certificationAssessment;

    beforeEach(() => {
      event = new AssessmentCompleted({
        assessmentId,
        userId,
        certificationCourseId: 123,
      });
      certificationAssessment = {
        id: assessmentId,
        certificationCourseId: Symbol('certificationCourseId'),
        userId,
        createdAt: Symbol('someCreationDate'),
      };
      sinon.stub(certificationAssessmentRepository, 'get').withArgs(assessmentId).resolves(certificationAssessment);
    });

    it('fails when event is not of correct type', async () => {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleCertificationScoring)(
        { event, ...dependencies, domainTransaction },
      );

      // then
      expect(error).not.to.be.null;
    });

    context('when an error different from a compute error happens', () => {
      const otherError = new Error();
      beforeEach(() => {
        sinon.stub(scoringCertificationService, 'calculateCertificationAssessmentScore').rejects(otherError);
        sinon.stub(AssessmentResult, 'BuildAlgoErrorResult');
        sinon.stub(assessmentResultRepository, 'save');
        sinon.stub(certificationCourseRepository, 'changeCompletionDate');
      });

      it('should not save any results', async () => {
        // when
        await catchErr(handleCertificationScoring)({
          event, ...dependencies,
        });

        // then
        expect(AssessmentResult.BuildAlgoErrorResult).to.not.have.been.called;
        expect(assessmentResultRepository.save).to.not.have.been.called;
        expect(certificationCourseRepository.changeCompletionDate).to.not.have.been.called;
      });
    });

    context('when an error of type CertificationComputeError happens while scoring the assessment', () => {
      const errorAssessmentResult = Symbol('ErrorAssessmentResult');
      const computeError = new CertificationComputeError();
      beforeEach(() => {
        sinon.stub(scoringCertificationService, 'calculateCertificationAssessmentScore').rejects(computeError);
        sinon.stub(AssessmentResult, 'BuildAlgoErrorResult').returns(errorAssessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves();
        sinon.stub(certificationCourseRepository, 'changeCompletionDate').resolves();
      });

      it('should call the scoring service with the right arguments', async () => {
        // when
        await handleCertificationScoring({
          event,
          ...dependencies,
          domainTransaction,
        });

        // then
        expect(scoringCertificationService.calculateCertificationAssessmentScore).to.have.been.calledWithExactly(
          certificationAssessment,
        );
      });

      it('should save the error result appropriately', async () => {
        // when
        await handleCertificationScoring({
          event,
          ...dependencies,
          domainTransaction,
        });

        // then
        expect(AssessmentResult.BuildAlgoErrorResult).to.have.been.calledWithExactly(
          computeError, certificationAssessment.id,
        );
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly(
          errorAssessmentResult,
        );
        expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWithExactly(
          certificationAssessment.certificationCourseId, now, domainTransaction,
        );
      });
    });

    context('when scoring is successful', () => {
      const assessmentResult = Symbol('AssessmentResult');
      const assessmentResultId = 99;
      const competenceMarkData1 = domainBuilder.buildCompetenceMark({ assessmentResultId });
      const competenceMarkData2 = domainBuilder.buildCompetenceMark({ assessmentResultId });
      const savedAssessmentResult = { id: assessmentResultId };
      const nbPix = Symbol('nbPix');
      const status = Symbol('status');
      const certificationAssessmentScore = {
        nbPix,
        status,
        competenceMarks: [competenceMarkData1, competenceMarkData2],
        percentageCorrectAnswers: 80,
      };

      beforeEach(() => {
        sinon.stub(AssessmentResult, 'BuildStandardAssessmentResult').returns(assessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves(savedAssessmentResult);
        sinon.stub(competenceMarkRepository, 'save').resolves();
        sinon.stub(certificationCourseRepository, 'changeCompletionDate').resolves();
        sinon.stub(scoringCertificationService, 'calculateCertificationAssessmentScore').resolves(certificationAssessmentScore);
      });

      it('should build and save an assessment result with the expected arguments', async () => {
        // when
        await handleCertificationScoring({
          event, ...dependencies, domainTransaction,
        });

        // then
        expect(AssessmentResult.BuildStandardAssessmentResult).to.have.been.calledWithExactly(
          certificationAssessmentScore.nbPix,
          certificationAssessmentScore.status,
          certificationAssessment.id,
        );
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly(assessmentResult, domainTransaction);
        expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWithExactly(
          certificationAssessment.certificationCourseId, now, domainTransaction,
        );
      });

      it('should return a CertificationScoringCompleted', async () => {
        // when
        const certificationScoringCompleted = await handleCertificationScoring({
          event, ...dependencies, domainTransaction,
        });

        // then
        expect(certificationScoringCompleted).to.be.instanceof(CertificationScoringCompleted);
        expect(certificationScoringCompleted).to.deep.equal({
          userId: event.userId,
          certificationCourseId: certificationAssessment.certificationCourseId,
          reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
        });
      });

      it('should build and save as many competence marks as present in the certificationAssessmentScore', async () => {
        // when
        await handleCertificationScoring({
          event, ...dependencies, domainTransaction,
        });

        // then
        expect(competenceMarkRepository.save.callCount).to.equal(certificationAssessmentScore.competenceMarks.length);
      });
    });
  });
  context('when completed assessment is not of type CERTIFICATION', () => {
    it('should not do anything', async () => {
      // given
      const event = new AssessmentCompleted(
        Symbol('an assessment Id'),
        Symbol('userId'),
        Symbol('targetProfileId'),
        Symbol('campaignParticipationId'),
        false,
      );

      // when
      const certificationScoringCompleted = await handleCertificationScoring({
        event, ...dependencies, domainTransaction,
      });

      expect(certificationScoringCompleted).to.be.null;
    });

  });
});
