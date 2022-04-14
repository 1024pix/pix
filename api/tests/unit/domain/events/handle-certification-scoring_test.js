const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { handleCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { CertificationComputeError } = require('../../../../lib/domain/errors');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

describe('Unit | Domain | Events | handle-certification-scoring', function () {
  let scoringCertificationService;
  let certificationAssessmentRepository;
  let assessmentResultRepository;
  let certificationCourseRepository;
  let competenceMarkRepository;

  const now = new Date('2019-01-01T05:06:07Z');
  let clock;
  let event;

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);

    scoringCertificationService = { calculateCertificationAssessmentScore: sinon.stub() };
    certificationAssessmentRepository = { get: sinon.stub() };
    assessmentResultRepository = { save: sinon.stub() };
    certificationCourseRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
      getCreationDate: sinon.stub(),
    };
    competenceMarkRepository = { save: sinon.stub() };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when assessment is of type CERTIFICATION', function () {
    const assessmentId = 1214;
    const certificationCourseId = 1234;
    const userId = 4567;
    let certificationAssessment;

    beforeEach(function () {
      event = new AssessmentCompleted({
        assessmentId,
        userId,
        certificationCourseId: 123,
      });
      certificationAssessment = {
        id: assessmentId,
        certificationCourseId,
        userId,
        createdAt: Symbol('someCreationDate'),
      };
      certificationAssessmentRepository.get.withArgs(assessmentId).resolves(certificationAssessment);
    });

    it('fails when event is not of correct type', async function () {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleCertificationScoring)({
        event,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationAssessmentRepository,
      });

      // then
      expect(error).not.to.be.null;
    });

    context('when an error different from a compute error happens', function () {
      const otherError = new Error();
      beforeEach(function () {
        scoringCertificationService.calculateCertificationAssessmentScore.rejects(otherError);
        sinon.stub(AssessmentResult, 'buildAlgoErrorResult');
      });

      it('should not save any results', async function () {
        // when
        await catchErr(handleCertificationScoring)({
          event,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationAssessmentRepository,
        });

        // then
        expect(AssessmentResult.buildAlgoErrorResult).to.not.have.been.called;
        expect(assessmentResultRepository.save).to.not.have.been.called;
        expect(certificationCourseRepository.update).to.not.have.been.called;
      });
    });

    context('when an error of type CertificationComputeError happens while scoring the assessment', function () {
      const computeError = new CertificationComputeError();
      let errorAssessmentResult;
      let certificationCourse;

      beforeEach(function () {
        errorAssessmentResult = Symbol('ErrorAssessmentResult');
        certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          completedAt: null,
        });

        scoringCertificationService.calculateCertificationAssessmentScore.rejects(computeError);
        sinon.stub(AssessmentResult, 'buildAlgoErrorResult').returns(errorAssessmentResult);
        assessmentResultRepository.save.resolves();
        certificationCourseRepository.get
          .withArgs(certificationAssessment.certificationCourseId)
          .resolves(certificationCourse);
        certificationCourseRepository.update.resolves(certificationCourse);
      });

      it('should call the scoring service with the right arguments', async function () {
        // when
        await handleCertificationScoring({
          event,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationAssessmentRepository,
        });

        // then
        expect(scoringCertificationService.calculateCertificationAssessmentScore).to.have.been.calledWithExactly({
          certificationAssessment,
          continueOnError: false,
        });
      });

      it('should save the error result appropriately', async function () {
        // when
        await handleCertificationScoring({
          event,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationAssessmentRepository,
        });

        // then
        expect(AssessmentResult.buildAlgoErrorResult).to.have.been.calledWithExactly({
          error: computeError,
          assessmentId: certificationAssessment.id,
          emitter: 'PIX-ALGO',
        });
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly(errorAssessmentResult);

        expect(certificationCourseRepository.update).to.have.been.calledWithExactly(
          new CertificationCourse({
            ...certificationCourse.toDTO(),
            completedAt: now,
          })
        );
      });
    });

    context('when scoring is successful', function () {
      const assessmentResultId = 99;
      let certificationCourse;
      let assessmentResult;
      let competenceMark1;
      let competenceMark2;
      let savedAssessmentResult;
      let certificationAssessmentScore;

      beforeEach(function () {
        certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          completedAt: null,
        });
        assessmentResult = Symbol('AssessmentResult');
        competenceMark1 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 5 });
        competenceMark2 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 4 });
        savedAssessmentResult = { id: assessmentResultId };
        certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          nbPix: 9,
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [competenceMark1, competenceMark2],
          percentageCorrectAnswers: 80,
        });

        sinon.stub(AssessmentResult, 'buildStandardAssessmentResult').returns(assessmentResult);
        assessmentResultRepository.save.resolves(savedAssessmentResult);
        competenceMarkRepository.save.resolves();
        scoringCertificationService.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
        certificationCourseRepository.get
          .withArgs(certificationAssessment.certificationCourseId)
          .resolves(certificationCourse);
        certificationCourseRepository.update.resolves(certificationCourse);
      });

      it('should build and save an assessment result with the expected arguments', async function () {
        // when
        await handleCertificationScoring({
          event,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationAssessmentRepository,
        });

        // then
        expect(AssessmentResult.buildStandardAssessmentResult).to.have.been.calledWithExactly({
          pixScore: certificationAssessmentScore.nbPix,
          reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
          status: certificationAssessmentScore.status,
          assessmentId: certificationAssessment.id,
          emitter: 'PIX-ALGO',
        });
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly(assessmentResult);
        expect(certificationCourseRepository.update).to.have.been.calledWithExactly(
          new CertificationCourse({
            ...certificationCourse.toDTO(),
            completedAt: now,
          })
        );
      });

      it('should return a CertificationScoringCompleted', async function () {
        // when
        const certificationScoringCompleted = await handleCertificationScoring({
          event,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationAssessmentRepository,
        });

        // then
        expect(certificationScoringCompleted).to.be.instanceof(CertificationScoringCompleted);
        expect(certificationScoringCompleted).to.deep.equal({
          userId: event.userId,
          certificationCourseId: certificationAssessment.certificationCourseId,
          reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
        });
      });

      it('should build and save as many competence marks as present in the certificationAssessmentScore', async function () {
        // when
        await handleCertificationScoring({
          event,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          certificationAssessmentRepository,
        });

        // then
        expect(competenceMarkRepository.save.callCount).to.equal(certificationAssessmentScore.competenceMarks.length);
      });
    });
  });
  context('when completed assessment is not of type CERTIFICATION', function () {
    it('should not do anything', async function () {
      // given
      const event = new AssessmentCompleted(
        Symbol('an assessment Id'),
        Symbol('userId'),
        Symbol('targetProfileId'),
        Symbol('campaignParticipationId'),
        false
      );

      // when
      const certificationScoringCompleted = await handleCertificationScoring({
        event,
        assessmentResultRepository,
        certificationCourseRepository,
        competenceMarkRepository,
        scoringCertificationService,
        certificationAssessmentRepository,
      });

      expect(certificationScoringCompleted).to.be.null;
    });
  });
});
