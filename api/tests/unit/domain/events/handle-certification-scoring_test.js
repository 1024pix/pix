const _ = require('lodash');
const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const events = require('../../../../lib/domain/events');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { CertificationComputeError } = require('../../../../lib/domain/errors');
const { UNCERTIFIED_LEVEL } = require('../../../../lib/domain/constants');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

describe('Unit | Domain | Events | handle-certification-scoring', () => {
  const scoringCertificationService = { calculateAssessmentScore: _.noop };
  const certificationAssessmentRepository = { get: _.noop };
  const assessmentResultRepository = { save: _.noop };
  const certificationCourseRepository = { changeCompletionDate: _.noop, getCreationDate: _.noop };
  const competenceMarkRepository = { save: _.noop };
  const domainTransaction = {};
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;
  let assessmentCompletedEvent;

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
      assessmentCompletedEvent = new AssessmentCompleted(
        assessmentId,
        userId,
        Symbol('targetProfileId'),
        Symbol('campaignParticipationId'),
        true,
      );
      certificationAssessment = {
        id: assessmentId,
        certificationCourseId: Symbol('certificationCourseId'),
        userId,
        createdAt: Symbol('someCreationDate'),
      };
      sinon.stub(certificationAssessmentRepository, 'get').withArgs(assessmentId).resolves(certificationAssessment);
    });

    context('when an error different from a compute error happens', () => {
      const otherError = new Error();
      beforeEach(() => {
        sinon.stub(scoringCertificationService, 'calculateAssessmentScore').rejects(otherError);
        sinon.stub(AssessmentResult, 'BuildAlgoErrorResult');
        sinon.stub(assessmentResultRepository, 'save');
        sinon.stub(certificationCourseRepository, 'changeCompletionDate');
      });

      it('should not save any results', async () => {
        // when
        await catchErr(events.handleCertificationScoring)({
          assessmentCompletedEvent, ...dependencies
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
        sinon.stub(scoringCertificationService, 'calculateAssessmentScore').rejects(computeError);
        sinon.stub(AssessmentResult, 'BuildAlgoErrorResult').returns(errorAssessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves();
        sinon.stub(certificationCourseRepository, 'changeCompletionDate').resolves();
      });

      it('should call the scoring service with the right arguments', async () => {
        // when
        await events.handleCertificationScoring({
          assessmentCompletedEvent,
          ...dependencies,
          domainTransaction,
        });

        // then
        expect(scoringCertificationService.calculateAssessmentScore).to.have.been.calledWithExactly(
          certificationAssessment
        );
      });

      it('should save the error result appropriately', async () => {
        // when
        await events.handleCertificationScoring({
          assessmentCompletedEvent,
          ...dependencies,
          domainTransaction,
        });

        // then
        expect(AssessmentResult.BuildAlgoErrorResult).to.have.been.calledWithExactly(
          computeError, certificationAssessment.id
        );
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly(
          errorAssessmentResult
        );
        expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWithExactly(
          certificationAssessment.certificationCourseId, now, domainTransaction
        );
      });
    });

    context('when scoring is successful', () => {
      const competenceMarkData1 = { dummyAttr: 'cm1' };
      const competenceMarkData2 = { dummyAttr: 'cm2' };
      const assessmentResult = Symbol('AssessmentResult');
      const assessmentResultId = 'assessmentResultId';
      const savedAssessmentResult = { id: assessmentResultId };

      beforeEach(() => {
        sinon.stub(AssessmentResult, 'BuildStandardAssessmentResult').returns(assessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves(savedAssessmentResult);
        sinon.stub(competenceMarkRepository, 'save').resolves();
        sinon.stub(certificationCourseRepository, 'changeCompletionDate').resolves();
      });

      context('when score is above 0', () => {
        const originalLevel = Symbol('originalLevel');
        const assessmentScore = {
          nbPix: 1,
          level: originalLevel,
          competenceMarks: [competenceMarkData1, competenceMarkData2],
          percentageCorrectAnswers: 80
        };

        beforeEach(() => {
          sinon.stub(scoringCertificationService, 'calculateAssessmentScore').resolves(assessmentScore);
        });

        it('should left untouched the calculated level in the assessment score', async () => {
          // when
          await events.handleCertificationScoring({
            assessmentCompletedEvent, ...dependencies, domainTransaction
          });

          // then
          expect(assessmentScore.level).to.deep.equal(originalLevel);
        });

        it('should build and save an assessment result with the expected arguments', async () => {
          // when
          await events.handleCertificationScoring({
            assessmentCompletedEvent, ...dependencies, domainTransaction
          });

          // then
          expect(AssessmentResult.BuildStandardAssessmentResult).to.have.been.calledWithExactly(
            originalLevel,
            assessmentScore.nbPix,
            AssessmentResult.status.VALIDATED,
            certificationAssessment.id
          );
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly(assessmentResult, domainTransaction);
          expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWithExactly(
            certificationAssessment.certificationCourseId, now, domainTransaction
          );
        });

        it('should return a CertificationScoringCompleted', async () => {
          // when
          const  certificationScoringCompleted = await events.handleCertificationScoring({
            assessmentCompletedEvent, ...dependencies, domainTransaction
          });

          // then
          expect(certificationScoringCompleted).to.be.instanceof(CertificationScoringCompleted);
          expect(certificationScoringCompleted).to.deep.equal({
            userId: assessmentCompletedEvent.userId,
            certificationCourseId: certificationAssessment.certificationCourseId,
            reproducibilityRate: assessmentScore.percentageCorrectAnswers,
            limitDate: certificationAssessment.createdAt,
          });
        });

        it('should build and save as many competence marks as present in the assessmentScore', async () => {
        // when
          await events.handleCertificationScoring({
            assessmentCompletedEvent, ...dependencies, domainTransaction
          });

          // then
          expect(competenceMarkRepository.save.callCount).to.equal(assessmentScore.competenceMarks.length);
        });
      });

      context('when score is equal 0', () => {
        const originalLevel = Symbol('originalLevel');
        const assessmentScore = {
          nbPix: 0,
          level: originalLevel,
          competenceMarks: [competenceMarkData1, competenceMarkData2]
        };
        beforeEach(() => {
          sinon.stub(scoringCertificationService, 'calculateAssessmentScore').resolves(assessmentScore);
        });

        it('should change level of the assessmentScore', async () => {
          // when
          await events.handleCertificationScoring({
            assessmentCompletedEvent, ...dependencies, domainTransaction
          });

          // then
          expect(assessmentScore.level).to.deep.equal(UNCERTIFIED_LEVEL);
        });

        it('should build and save an assessment result with the expected arguments', async () => {
          // when
          await events.handleCertificationScoring({
            assessmentCompletedEvent, ...dependencies, domainTransaction
          });

          // then
          expect(AssessmentResult.BuildStandardAssessmentResult).to.have.been.calledWithExactly(
            UNCERTIFIED_LEVEL,
            assessmentScore.nbPix,
            AssessmentResult.status.REJECTED,
            certificationAssessment.id
          );
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly(
            assessmentResult, domainTransaction
          );
          expect(certificationCourseRepository.changeCompletionDate).to.have.been.calledWithExactly(
            certificationAssessment.certificationCourseId, now, domainTransaction
          );
        });
      });
    });
  });
  context('when completed assessment is not of type CERTIFICATION', () => {
    it('should not do anything', async () => {
      // given
      const assessmentCompletedEvent = new AssessmentCompleted(
        Symbol('an assessment Id'),
        Symbol('userId'),
        Symbol('targetProfileId'),
        Symbol('campaignParticipationId'),
        false,
      );
      sinon.stub(certificationAssessmentRepository, 'get').rejects();

      // when
      const certificationScoringCompleted = await events.handleCertificationScoring({
        assessmentCompletedEvent, ...dependencies, domainTransaction
      });

      expect(certificationAssessmentRepository.get).to.not.have.been.called;
      expect(certificationScoringCompleted).to.be.null;
    });

  });
});

function _buildCertificationAssessment() {
  return domainBuilder.buildAssessment({
    id: Symbol('assessmentId'),
    certificationCourseId: Symbol('certificationCourseId'),
    state: 'started',
    type: Assessment.types.CERTIFICATION,
    userId,
  });
}
