const _ = require('lodash');
const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { handleCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { CertificationComputeError } = require('../../../../lib/domain/errors');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

describe('Unit | Domain | Events | handle-certification-scoring', function() {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const scoringCertificationService = { calculateCertificationAssessmentScore: _.noop };
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const certificationAssessmentRepository = { get: _.noop };
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const assessmentResultRepository = { save: _.noop };
  const certificationCourseRepository = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    get: _.noop,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    update: _.noop,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    getCreationDate: _.noop,
  };
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const competenceMarkRepository = { save: _.noop };
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

  beforeEach(function() {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(function() {
    clock.restore();
  });

  context('when assessment is of type CERTIFICATION', function() {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const assessmentId = Symbol('assessmentId');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const userId = Symbol('userId');
    const certificationCourseId = 1234;
    let certificationAssessment;

    beforeEach(function() {
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
      sinon.stub(certificationAssessmentRepository, 'get').withArgs(assessmentId).resolves(certificationAssessment);
    });

    it('fails when event is not of correct type', async function() {
      // given
      const event = 'not an event of the correct type';
      // when / then
      const error = await catchErr(handleCertificationScoring)(
        { event, ...dependencies },
      );

      // then
      expect(error).not.to.be.null;
    });

    context('when an error different from a compute error happens', function() {
      const otherError = new Error();
      beforeEach(function() {
        sinon.stub(scoringCertificationService, 'calculateCertificationAssessmentScore').rejects(otherError);
        sinon.stub(AssessmentResult, 'buildAlgoErrorResult');
        sinon.stub(assessmentResultRepository, 'save');
        sinon.stub(certificationCourseRepository, 'get');
        sinon.stub(certificationCourseRepository, 'update');
      });

      it('should not save any results', async function() {
        // when
        await catchErr(handleCertificationScoring)({
          event, ...dependencies,
        });

        // then
        expect(AssessmentResult.buildAlgoErrorResult).to.not.have.been.called;
        expect(assessmentResultRepository.save).to.not.have.been.called;
        expect(certificationCourseRepository.update).to.not.have.been.called;
      });
    });

    context('when an error of type CertificationComputeError happens while scoring the assessment', function() {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const errorAssessmentResult = Symbol('ErrorAssessmentResult');
      const computeError = new CertificationComputeError();
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const certificationCourse = domainBuilder.buildCertificationCourse({
        id: certificationCourseId,
        completedAt: null,
      });
      beforeEach(function() {
        sinon.stub(scoringCertificationService, 'calculateCertificationAssessmentScore').rejects(computeError);
        sinon.stub(AssessmentResult, 'buildAlgoErrorResult').returns(errorAssessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves();
        sinon.stub(certificationCourseRepository, 'get').withArgs(certificationAssessment.certificationCourseId).resolves(certificationCourse);
        sinon.stub(certificationCourseRepository, 'update').resolves(certificationCourse);
      });

      it('should call the scoring service with the right arguments', async function() {
        // when
        await handleCertificationScoring({
          event,
          ...dependencies,
        });

        // then
        expect(scoringCertificationService.calculateCertificationAssessmentScore).to.have.been.calledWithExactly({
          certificationAssessment,
          continueOnError: false,
        });
      });

      it('should save the error result appropriately', async function() {
        // when
        await handleCertificationScoring({
          event,
          ...dependencies,
        });

        // then
        expect(AssessmentResult.buildAlgoErrorResult).to.have.been.calledWithExactly({
          error: computeError,
          assessmentId: certificationAssessment.id,
          emitter: 'PIX-ALGO',
        });
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly(
          errorAssessmentResult,
        );

        expect(certificationCourseRepository.update).to.have.been.calledWithExactly(
          new CertificationCourse({
            ...certificationCourse.toDTO(),
            completedAt: now,
          }),
        );
      });
    });

    context('when scoring is successful', function() {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const certificationCourse = domainBuilder.buildCertificationCourse({
        id: certificationCourseId,
        completedAt: null,
      });
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const assessmentResult = Symbol('AssessmentResult');
      const assessmentResultId = 99;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const competenceMarkData1 = domainBuilder.buildCompetenceMark({ assessmentResultId });
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const competenceMarkData2 = domainBuilder.buildCompetenceMark({ assessmentResultId });
      const savedAssessmentResult = { id: assessmentResultId };
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const nbPix = Symbol('nbPix');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const status = Symbol('status');
      const certificationAssessmentScore = {
        nbPix,
        status,
        competenceMarks: [competenceMarkData1, competenceMarkData2],
        percentageCorrectAnswers: 80,
      };

      beforeEach(function() {
        sinon.stub(AssessmentResult, 'buildStandardAssessmentResult').returns(assessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves(savedAssessmentResult);
        sinon.stub(competenceMarkRepository, 'save').resolves();
        sinon.stub(scoringCertificationService, 'calculateCertificationAssessmentScore').resolves(certificationAssessmentScore);
        sinon.stub(certificationCourseRepository, 'get').withArgs(certificationAssessment.certificationCourseId).resolves(certificationCourse);
        sinon.stub(certificationCourseRepository, 'update').resolves(certificationCourse);
      });

      it('should build and save an assessment result with the expected arguments', async function() {
        // when
        await handleCertificationScoring({
          event, ...dependencies,
        });

        // then
        expect(AssessmentResult.buildStandardAssessmentResult).to.have.been.calledWithExactly({
          pixScore: certificationAssessmentScore.nbPix,
          status: certificationAssessmentScore.status,
          assessmentId: certificationAssessment.id,
          emitter: 'PIX-ALGO',
        });
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly(assessmentResult);
        expect(certificationCourseRepository.update).to.have.been.calledWithExactly(
          new CertificationCourse({
            ...certificationCourse.toDTO(),
            completedAt: now,
          }),
        );
      });

      it('should return a CertificationScoringCompleted', async function() {
        // when
        const certificationScoringCompleted = await handleCertificationScoring({
          event, ...dependencies,
        });

        // then
        expect(certificationScoringCompleted).to.be.instanceof(CertificationScoringCompleted);
        expect(certificationScoringCompleted).to.deep.equal({
          userId: event.userId,
          certificationCourseId: certificationAssessment.certificationCourseId,
          reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
        });
      });

      it('should build and save as many competence marks as present in the certificationAssessmentScore', async function() {
        // when
        await handleCertificationScoring({
          event, ...dependencies,
        });

        // then
        expect(competenceMarkRepository.save.callCount).to.equal(certificationAssessmentScore.competenceMarks.length);
      });
    });
  });
  context('when completed assessment is not of type CERTIFICATION', function() {
    it('should not do anything', async function() {
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
        event, ...dependencies,
      });

      expect(certificationScoringCompleted).to.be.null;
    });

  });
});
