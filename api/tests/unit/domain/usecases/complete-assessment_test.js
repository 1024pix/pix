import _ from 'lodash';
import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper.js';
import { completeAssessment } from '../../../../lib/domain/usecases/complete-assessment.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { AlreadyRatedAssessmentError } from '../../../../lib/domain/errors.js';
import { AssessmentCompleted } from '../../../../lib/domain/events/AssessmentCompleted.js';
import { CampaignParticipationStatuses } from '../../../../lib/domain/models/CampaignParticipationStatuses.js';

describe('Unit | UseCase | complete-assessment', function () {
  let assessmentRepository;
  let campaignParticipationRepository;
  let domainTransaction;
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(function () {
    domainTransaction = Symbol('domainTransaction');
    assessmentRepository = {
      get: _.noop,
      completeByAssessmentId: _.noop,
    };

    campaignParticipationRepository = {
      get: _.noop,
      update: _.noop,
    };

    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when assessment is already completed', function () {
    const assessmentId = 'assessmentId';

    beforeEach(function () {
      const completedAssessment = domainBuilder.buildAssessment({
        id: assessmentId,
        state: 'completed',
      });
      sinon.stub(assessmentRepository, 'get').withArgs(assessmentId, domainTransaction).resolves(completedAssessment);
    });

    it('should return an AlreadyRatedAssessmentError', async function () {
      // when
      const err = await catchErr(completeAssessment)({
        assessmentId,
        domainTransaction,
        assessmentRepository,
        campaignParticipationRepository,
      });

      // then
      expect(err).to.be.an.instanceof(AlreadyRatedAssessmentError);
    });
  });

  context('when assessment is not yet completed', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      _buildCompetenceEvaluationAssessment(),
      // eslint-disable-next-line mocha/no-setup-in-describe
      _buildCampaignAssessment(),
      // eslint-disable-next-line mocha/no-setup-in-describe
      _buildCertificationAssessment(),
    ].forEach((assessment) => {
      // eslint-disable-next-line mocha/no-setup-in-describe
      context(`common behavior when assessment is of type ${assessment.type}`, function () {
        beforeEach(function () {
          sinon.stub(assessmentRepository, 'get').withArgs(assessment.id, domainTransaction).resolves(assessment);
          sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        });

        it('should complete the assessment', async function () {
          // when
          await completeAssessment({
            assessmentId: assessment.id,
            domainTransaction,
            assessmentRepository,
            campaignParticipationRepository,
          });

          // then
          expect(assessmentRepository.completeByAssessmentId.calledWithExactly(assessment.id, domainTransaction)).to.be
            .true;
        });

        it('should return a AssessmentCompleted event', async function () {
          // when
          const result = await completeAssessment({
            assessmentId: assessment.id,
            domainTransaction,
            assessmentRepository,
            campaignParticipationRepository,
          });

          // then
          expect(result.event).to.be.an.instanceof(AssessmentCompleted);
          expect(result.event.userId).to.equal(assessment.userId);
          expect(result.event.assessmentId).to.equal(assessment.id);
          expect(result.assessment).to.equal(assessment);
        });
      });
    });

    context('when assessment is of type CAMPAIGN', function () {
      it('should return a AssessmentCompleted event with a userId and targetProfileId', async function () {
        const assessment = _buildCampaignAssessment();

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id, domainTransaction).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        sinon.stub(campaignParticipationRepository, 'get').resolves({ id: 1 });
        sinon.stub(campaignParticipationRepository, 'update').resolves();
        // when
        const result = await completeAssessment({
          assessmentId: assessment.id,
          domainTransaction,
          assessmentRepository,
          campaignParticipationRepository,
        });

        // then
        expect(result.event.campaignParticipationId).to.equal(assessment.campaignParticipationId);
      });

      it('should call update campaign participation status', async function () {
        const assessment = _buildCampaignAssessment();
        const { TO_SHARE } = CampaignParticipationStatuses;

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id, domainTransaction).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        sinon.stub(campaignParticipationRepository, 'update').resolves();
        // when
        await completeAssessment({
          assessmentId: assessment.id,
          domainTransaction,
          assessmentRepository,
          campaignParticipationRepository,
        });

        // then
        expect(
          campaignParticipationRepository.update.calledWithExactly(
            { id: assessment.campaignParticipationId, status: TO_SHARE },
            domainTransaction,
          ),
        ).to.be.true;
      });
    });

    context('when assessment is of type CERTIFICATION', function () {
      it('should return a AssessmentCompleted event with certification flag', async function () {
        const assessment = _buildCertificationAssessment();

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id, domainTransaction).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        sinon.stub(campaignParticipationRepository, 'update').resolves();
        // when
        const result = await completeAssessment({
          assessmentId: assessment.id,
          domainTransaction,
          assessmentRepository,
          campaignParticipationRepository,
        });

        // then
        expect(campaignParticipationRepository.update).to.not.have.been.called;
        expect(result.event.isCertificationType).to.equal(true);
      });
    });
  });
});

function _buildCompetenceEvaluationAssessment() {
  return domainBuilder.buildAssessment.ofTypeCompetenceEvaluation({
    id: Symbol('assessmentId'),
    state: 'started',
  });
}

function _buildCampaignAssessment() {
  return domainBuilder.buildAssessment.ofTypeCampaign({
    id: Symbol('assessmentId'),
    state: 'started',
    type: Assessment.types.CAMPAIGN,
    userId: Symbol('userId'),
    campaignParticipationId: Symbol('campaignParticipationId'),
  });
}

function _buildCertificationAssessment() {
  return domainBuilder.buildAssessment({
    id: Symbol('assessmentId'),
    certificationCourseId: Symbol('certificationCourseId'),
    state: 'started',
    type: Assessment.types.CERTIFICATION,
  });
}
