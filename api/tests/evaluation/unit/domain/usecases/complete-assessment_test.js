import _ from 'lodash';
import sinon from 'sinon';

import { CertificationCompletedJob } from '../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { AlreadyRatedAssessmentError } from '../../../../../src/evaluation/domain/errors.js';
import { completeAssessment } from '../../../../../src/evaluation/domain/usecases/complete-assessment.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | complete-assessment', function () {
  let assessmentRepository;
  let certificationEvaluationRepository;
  const now = new Date('2019-01-01T05:06:07Z');
  let clock;

  beforeEach(function () {
    assessmentRepository = {
      get: _.noop,
      completeByAssessmentId: _.noop,
    };

    certificationEvaluationRepository = {
      completeCertificationAssessment: _.noop,
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
        type: 'COMPETENCE_EVALUATION',
      });
      sinon.stub(assessmentRepository, 'get').withArgs(assessmentId).resolves(completedAssessment);
    });

    it('should return an AlreadyRatedAssessmentError', async function () {
      // when
      const err = await catchErr(completeAssessment)({
        assessmentId,
        assessmentRepository,
        certificationEvaluationRepository,
      });

      // then
      expect(err).to.be.an.instanceof(AlreadyRatedAssessmentError);
    });
  });

  context('when assessment is not yet completed', function () {
    [_buildCompetenceEvaluationAssessment(), _buildCampaignAssessment()].forEach((assessment) => {
      context(`common behavior when assessment is of type ${assessment.type}`, function () {
        beforeEach(function () {
          sinon.stub(assessmentRepository, 'get').withArgs(assessment.id).resolves(assessment);
          sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
          sinon
            .stub(certificationEvaluationRepository, 'completeCertificationAssessment')
            .rejects(new Error('should not been called'));
        });

        it('should complete the assessment', async function () {
          // when
          await completeAssessment({
            assessmentId: assessment.id,
            assessmentRepository,
            certificationEvaluationRepository,
          });

          // then
          expect(assessmentRepository.completeByAssessmentId.calledWithExactly(assessment.id)).to.be.true;
        });
      });
    });

    context('when assessment is of type CERTIFICATION', function () {
      it('should call internal certification evaluation API', async function () {
        const assessment = _buildCertificationAssessment();

        const expectedCompletedAssessment = Symbol('completedAssessment');
        sinon
          .stub(assessmentRepository, 'get')
          .withArgs(assessment.id)
          .onFirstCall()
          .resolves(assessment)
          .onSecondCall()
          .resolves(expectedCompletedAssessment);
        sinon.stub(assessmentRepository, 'completeByAssessmentId').resolves();
        sinon
          .stub(certificationEvaluationRepository, 'completeCertificationAssessment')
          .withArgs(
            new CertificationCompletedJob({
              locale: 'fr',
              certificationCourseId: assessment.certificationCourseId,
            }),
          )
          .resolves();

        // when
        const actualCompletedAssessment = await completeAssessment({
          locale: 'fr',
          assessmentId: assessment.id,
          assessmentRepository,
          certificationEvaluationRepository,
        });

        // then
        expect(certificationEvaluationRepository.completeCertificationAssessment).to.have.been.called;
        expect(actualCompletedAssessment).to.deepEqualInstance(expectedCompletedAssessment);
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
