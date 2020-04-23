const _ = require('lodash');
const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const completeAssessment = require('../../../../lib/domain/usecases/complete-assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { AlreadyRatedAssessmentError } = require('../../../../lib/domain/errors');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | UseCase | complete-assessment', () => {
  const scoringCertificationService = { calculateAssessmentScore: _.noop };
  const assessmentRepository = {
    get: _.noop,
    completeByAssessmentId: _.noop,
  };
  const domainTransaction = Symbol('domainTransaction');
  const assessmentResultRepository = { save: _.noop };
  const certificationCourseRepository = { changeCompletionDate: _.noop };
  const competenceMarkRepository = { save: _.noop };
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(() => {
    clock.restore();
  });

  context('when assessment is already completed', () => {
    const assessmentId = 'assessmentId';

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
        domainTransaction,
      });

      // then
      expect(err).to.be.an.instanceof(AlreadyRatedAssessmentError);
    });
  });

  context('when assessment is not yet completed', () => {
    [
      _buildCompetenceEvaluationAssessment(),
      _buildSmartPlacementAssessment(),
      _buildCertificationAssessment()
    ]
      .forEach((assessment) => {

        context(`common behavior when assessment is of type ${assessment.type}`, () => {

          beforeEach(() => {
            sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
            sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
          });

          it('should complete the assessment', async () => {
            // when
            await completeAssessment({
              assessmentId: assessment.id,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
              domainTransaction,
            });

            // then
            expect(assessmentRepository.completeByAssessmentId.calledWithExactly(assessment.id, domainTransaction)).to.be.true;
          });

          it('should return a AssessmentCompleted event', async () => {
            // when
            const result = await completeAssessment({
              assessmentId: assessment.id,
              assessmentRepository,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
              domainTransaction,
            });

            // then
            expect(result).to.be.an.instanceof(AssessmentCompleted);
            expect(result.userId).to.equal(assessment.userId);
            expect(result.assessmentId).to.equal(assessment.id);
          });
        });
      });

    context('when assessment is of type SMARTPLACEMENT', () => {
      it('should return a AssessmentCompleted event with a userId and targetProfileId', async () => {
        const assessment = _buildSmartPlacementAssessment();

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        // when
        const result = await completeAssessment({
          assessmentId: assessment.id,
          assessmentRepository,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          domainTransaction
        });

        // then
        expect(result.targetProfileId).to.equal(
          assessment.campaignParticipation.campaign.targetProfileId
        );
        expect(result.campaignParticipationId).to.equal(assessment.campaignParticipation.id);
      });
    });

    context('when assessment is of type CERTIFICATION', () => {
      it('should return a AssessmentCompleted event with certification flag', async () => {
        const assessment = _buildCertificationAssessment();

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        // when
        const result = await completeAssessment({
          assessmentId: assessment.id,
          assessmentRepository,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          domainTransaction
        });

        // then
        expect(result.isCertification).to.equal(true);
      });
    });
  });
});

function _buildCompetenceEvaluationAssessment() {
  return domainBuilder.buildAssessment.ofTypeCompetenceEvaluation({
    id: Symbol('assessmentId'),
    state: 'started'
  });
}

function _buildSmartPlacementAssessment() {
  const assessment = domainBuilder.buildAssessment(
    {
      id: Symbol('assessmentId'),
      state: 'started',
      type: Assessment.types.SMARTPLACEMENT,
      userId: Symbol('userId'),
      campaignParticipation: {
        id: Symbol('campaignParticipationId'),
        campaign: {
          targetProfileId: Symbol('targetProfileId')
        }
      }
    }
  );
  return assessment;
}

function _buildCertificationAssessment() {
  return domainBuilder.buildAssessment({
    id: Symbol('assessmentId'),
    certificationCourseId: Symbol('certificationCourseId'),
    state: 'started',
    type: Assessment.types.CERTIFICATION,
  });
}
