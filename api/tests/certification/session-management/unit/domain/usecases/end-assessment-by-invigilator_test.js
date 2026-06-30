import sinon from 'sinon';

import { endAssessmentByInvigilator } from '../../../../../../src/certification/session-management/domain/usecases/end-assessment-by-invigilator.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | end-assessment-by-invigilator', function () {
  let certificationAssessmentRepository;

  beforeEach(function () {
    certificationAssessmentRepository = {
      getByCertificationCandidateId: sinon.stub(),
      save: sinon.stub(),
    };
  });

  context('when assessment is already completed', function () {
    it('should not end the assessment', async function () {
      // when
      const certificationCandidateId = domainBuilder.certification.sessionManagement.buildCertificationCandidate().id;
      const completedCertificationAssessment = domainBuilder.buildCertificationAssessment({
        state: Assessment.states.COMPLETED,
      });

      certificationAssessmentRepository.getByCertificationCandidateId
        .withArgs({ certificationCandidateId })
        .resolves(completedCertificationAssessment);

      await endAssessmentByInvigilator({
        certificationCandidateId,
        certificationAssessmentRepository,
      });

      // then
      expect(certificationAssessmentRepository.save).not.to.have.been.called;
    });
  });

  context('when assessment is not completed', function () {
    it('should end the assessment', async function () {
      // when
      const certificationCandidateId = domainBuilder.certification.sessionManagement.buildCertificationCandidate().id;
      const startedCertificationAssessment = domainBuilder.buildCertificationAssessment({
        state: Assessment.states.STARTED,
      });

      certificationAssessmentRepository.getByCertificationCandidateId
        .withArgs({ certificationCandidateId })
        .resolves(startedCertificationAssessment);

      await endAssessmentByInvigilator({
        certificationCandidateId,
        certificationAssessmentRepository,
      });

      // then
      expect(startedCertificationAssessment.state).to.equal(Assessment.states.ENDED_BY_INVIGILATOR);
      expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(startedCertificationAssessment);
    });
  });
});
