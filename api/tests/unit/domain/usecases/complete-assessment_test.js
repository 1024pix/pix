const _ = require('lodash');
const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const completeAssessment = require('../../../../lib/domain/usecases/complete-assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { AlreadyRatedAssessmentError, CertificationComputeError } = require('../../../../lib/domain/errors');
const { UNCERTIFIED_LEVEL } = require('../../../../lib/domain/constants');

describe('Unit | UseCase | complete-assessment', () => {
  const scoringCertificationService = { calculateAssessmentScore: _.noop };
  const assessmentRepository = {
    get: _.noop,
    completeByAssessmentId: _.noop,
  };
  const assessmentResultRepository = { save: _.noop };
  const certificationCourseRepository = { changeCompletionDate: _.noop };
  const competenceMarkRepository = { save: _.noop };
  const assessmentId = 'assessmentId';
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(() => {
    clock.restore();
  });

  context('when assessment is already completed', () => {
    beforeEach(() => {
      const completedAssessment = domainBuilder.buildAssessment({
        id: assessmentId,
        state: 'completed',
      });
      sinon.stub(assessmentRepository, 'get').withArgs(assessmentId).resolves(completedAssessment);
    });

    it('should return an AlreadyRatedAssessmentError', async () => {
      // when
      const err = await catchErr(completeAssessment)({
        assessmentId,
        assessmentRepository,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringCertificationService,
      });

      // then
      expect(err).to.be.an.instanceof(AlreadyRatedAssessmentError);
    });
  });

  context('when assessment is not yet completed', () => {
    let assessment;

    context('when assessment is not of type CERTIFICATION', () => {

      beforeEach(() => {
        assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          state: 'started',
          type: 'NOT_CERTIFICATION',
        });
        sinon.stub(assessmentRepository, 'get').withArgs(assessmentId).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
      });

      it('should return the saved completed assessment', async () => {
        // when
        const actualCompletedAssessment = await completeAssessment({
          assessmentId,
          assessmentRepository,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
        });

        // then
        expect(actualCompletedAssessment.isCompleted()).to.be.true;
        expect(assessmentRepository.completeByAssessmentId.calledWithExactly(assessmentId)).to.be.true;
      });
    });

    context('when assessment is of type CERTIFICATION', () => {
      const certificationCourseId = 'certificationCourseId';

      beforeEach(() => {
        assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          certificationCourseId,
          state: 'started',
          type: 'CERTIFICATION',
        });
        sinon.stub(assessmentRepository, 'get').withArgs(assessmentId).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
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
          await catchErr(completeAssessment)({
            assessmentId,
            assessmentRepository,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
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
          await completeAssessment({
            assessmentId,
            assessmentRepository,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
          });

          // then
          expect(scoringCertificationService.calculateAssessmentScore.calledWithExactly(assessment)).to.be.true;
        });

        it('should save the error result appropriately', async () => {
          // when
          await completeAssessment({
            assessmentId,
            assessmentRepository,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
          });

          // then
          expect(AssessmentResult.BuildAlgoErrorResult.calledWithExactly(computeError, assessment.id)).to.be.true;
          expect(assessmentResultRepository.save.calledWithExactly(errorAssessmentResult)).to.be.true;
          expect(certificationCourseRepository.changeCompletionDate.calledWithExactly(assessment.certificationCourseId, now)).to.be.true;
        });

        it('should still complete the assessment', async () => {
          // when
          const actualCompletedAssessment = await completeAssessment({
            assessmentId,
            assessmentRepository,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
          });

          // then
          expect(actualCompletedAssessment.isCompleted()).to.be.true;
          expect(assessmentRepository.completeByAssessmentId.calledWithExactly(assessmentId)).to.be.true;
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
          const assessmentScore = { nbPix: 1, level: originalLevel, competenceMarks: [ competenceMarkData1, competenceMarkData2 ] };
          beforeEach(() => {
            sinon.stub(scoringCertificationService, 'calculateAssessmentScore').resolves(assessmentScore);
          });

          it('should left untouched the calculated level in the assessment score', async () => {
            // when
            await completeAssessment({
              assessmentId,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
            });

            // then
            expect(assessmentScore.level).to.deep.equal(originalLevel);
          });

          it('should build and save an assessment result with the expected arguments', async () => {
            // when
            await completeAssessment({
              assessmentId,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
            });

            // then
            expect(AssessmentResult.BuildStandardAssessmentResult.calledWithExactly(originalLevel, assessmentScore.nbPix, AssessmentResult.status.VALIDATED, assessment.id))
              .to.be.true;
            expect(assessmentResultRepository.save.calledWithExactly(assessmentResult)).to.be.true;
            expect(certificationCourseRepository.changeCompletionDate.calledWithExactly(assessment.certificationCourseId, now)).to.be.true;
          });

          it('should build and save as many competence marks as present in the assessmentScore', async () => {
            // when
            await completeAssessment({
              assessmentId,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
            });

            // then
            expect(competenceMarkRepository.save.callCount).to.equal(assessmentScore.competenceMarks.length);
          });

          it('should still complete the assessment', async () => {
            // when
            const actualCompletedAssessment = await completeAssessment({
              assessmentId,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
            });

            // then
            expect(actualCompletedAssessment.isCompleted()).to.be.true;
            expect(assessmentRepository.completeByAssessmentId.calledWithExactly(assessmentId)).to.be.true;
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
            await completeAssessment({
              assessmentId,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
            });

            // then
            expect(assessmentScore.level).to.deep.equal(UNCERTIFIED_LEVEL);
          });

          it('should build and save an assessment result with the expected arguments', async () => {
            // when
            await completeAssessment({
              assessmentId,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
            });

            // then
            expect(AssessmentResult.BuildStandardAssessmentResult.calledWithExactly(UNCERTIFIED_LEVEL, assessmentScore.nbPix, AssessmentResult.status.REJECTED, assessment.id))
              .to.be.true;
            expect(assessmentResultRepository.save.calledWithExactly(assessmentResult)).to.be.true;
            expect(certificationCourseRepository.changeCompletionDate.calledWithExactly(assessment.certificationCourseId, now)).to.be.true;
          });
        });
      });
    });
  });
});
