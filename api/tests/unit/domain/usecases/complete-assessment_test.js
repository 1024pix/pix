import _ from 'lodash';

import { CertificationCompletedJob } from '../../../../lib/domain/events/CertificationCompleted.js';
import { completeAssessment } from '../../../../lib/domain/usecases/complete-assessment.js';
import { ParticipationCompletedJob } from '../../../../src/prescription/campaign-participation/domain/models/ParticipationCompletedJob.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { AlreadyRatedAssessmentError } from '../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | complete-assessment', function () {
  let assessmentRepository;
  let campaignParticipationBCRepository;
  let certificationCompletedJobRepository;
  let participationCompletedJobRepository;
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(function () {
    assessmentRepository = {
      get: _.noop,
      completeByAssessmentId: _.noop,
    };

    campaignParticipationBCRepository = {
      get: _.noop,
      update: _.noop,
    };

    certificationCompletedJobRepository = {
      performAsync: _.noop,
    };

    participationCompletedJobRepository = {
      performAsync: _.noop,
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
      sinon.stub(assessmentRepository, 'get').withArgs(assessmentId).resolves(completedAssessment);
    });

    it('should return an AlreadyRatedAssessmentError', async function () {
      // when
      const err = await catchErr(completeAssessment)({
        assessmentId,
        assessmentRepository,
        campaignParticipationBCRepository,
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
          sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
          sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
          sinon.stub(certificationCompletedJobRepository, 'performAsync').resolves();
          sinon.stub(participationCompletedJobRepository, 'performAsync').resolves();
        });

        it('should complete the assessment', async function () {
          // when
          await completeAssessment({
            assessmentId: assessment.id,
            assessmentRepository,
            campaignParticipationBCRepository,
            certificationCompletedJobRepository,
            participationCompletedJobRepository,
          });

          // then
          expect(assessmentRepository.completeByAssessmentId.calledWithExactly(assessment.id)).to.be.true;
        });
      });
    });

    context('when assessment is of type CAMPAIGN', function () {
      it('should call update campaign participation status', async function () {
        const assessment = _buildCampaignAssessment();
        const { TO_SHARE } = CampaignParticipationStatuses;

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        sinon.stub(campaignParticipationBCRepository, 'update').resolves();
        sinon.stub(participationCompletedJobRepository, 'performAsync').resolves();
        // when
        await completeAssessment({
          assessmentId: assessment.id,
          assessmentRepository,
          campaignParticipationBCRepository,
          participationCompletedJobRepository,
        });

        // then
        expect(
          campaignParticipationBCRepository.update.calledWithExactly({
            id: assessment.campaignParticipationId,
            status: TO_SHARE,
          }),
        ).to.be.true;
      });

      it('should trigger pole emploi participation completed job', async function () {
        const assessment = _buildCampaignAssessment();

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        sinon.stub(campaignParticipationBCRepository, 'get').resolves({ id: 1 });
        sinon.stub(campaignParticipationBCRepository, 'update').resolves();
        sinon.stub(certificationCompletedJobRepository, 'performAsync').resolves();
        sinon.stub(participationCompletedJobRepository, 'performAsync').resolves();
        // when
        await completeAssessment({
          assessmentId: assessment.id,
          assessmentRepository,
          campaignParticipationBCRepository,
          certificationCompletedJobRepository,
          participationCompletedJobRepository,
        });

        // then
        expect(participationCompletedJobRepository.performAsync).to.have.been.calledWith(
          new ParticipationCompletedJob({ campaignParticipationId: assessment.campaignParticipationId }),
        );
        expect(certificationCompletedJobRepository.performAsync).to.not.have.been.called;
      });
    });

    context('when assessment is of type CERTIFICATION', function () {
      it('should trigger the certification completed job', async function () {
        const assessment = _buildCertificationAssessment();

        sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        sinon.stub(campaignParticipationBCRepository, 'update').resolves();
        sinon.stub(participationCompletedJobRepository, 'performAsync').resolves();
        sinon
          .stub(certificationCompletedJobRepository, 'performAsync')
          .withArgs(
            new CertificationCompletedJob({
              assessmentId: assessment.id,
              userId: assessment.userId,
              certificationCourseId: assessment.certificationCourseId,
            }),
          )
          .resolves();
        // when
        await completeAssessment({
          assessmentId: assessment.id,
          assessmentRepository,
          campaignParticipationBCRepository,
          certificationCompletedJobRepository,
          participationCompletedJobRepository,
        });

        // then
        expect(campaignParticipationBCRepository.update).to.not.have.been.called;
        expect(participationCompletedJobRepository.performAsync).to.not.have.been.called;
        expect(certificationCompletedJobRepository.performAsync).to.have.been.called;
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
