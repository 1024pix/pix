import { expect } from 'chai';

import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentDtoFactory } from '../../../../../src/shared/domain/models/AssessmentDtoFactory.js';
import { CampaignAssessment } from '../../../../../src/shared/domain/read-models/CampaignAssessment.js';
import { CertificationAssessment } from '../../../../../src/shared/domain/read-models/CertificationAssessment.js';
import { CompetenceEvaluationAssessment } from '../../../../../src/shared/domain/read-models/CompetenceEvaluationAssessment.js';
import { DemoAssessment } from '../../../../../src/shared/domain/read-models/DemoAssessment.js';
import { PreviewAssessment } from '../../../../../src/shared/domain/read-models/PreviewAssessment.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Models | AssessmentDtoFactory', function () {
  describe('#toDto', function () {
    describe('when assessment is type CERTIFICATION', function () {
      it('should return a CertificationAssessment', function () {
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CERTIFICATION });

        const dto = AssessmentDtoFactory.toDto(assessment);

        expect(dto).to.be.instanceOf(CertificationAssessment);
      });
    });
    describe('when assessment is type CAMPAIGN', function () {
      it('should return a CampaignAssessment', function () {
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CAMPAIGN });

        const dto = AssessmentDtoFactory.toDto(assessment, 0.6);

        expect(dto).to.be.instanceOf(CampaignAssessment);
        expect(dto.globalProgression).equal(0.6);
      });
    });
    describe('when assessment is type DEMO', function () {
      it('should return a DemoAssessment', function () {
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });

        const dto = AssessmentDtoFactory.toDto(assessment);

        expect(dto).to.be.instanceOf(DemoAssessment);
      });
    });

    describe('when assessment is type COMPETENCE_EVALUATION', function () {
      it('should return a CompetenceEvaluationAssessment', function () {
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });

        const dto = AssessmentDtoFactory.toDto(assessment);

        expect(dto).to.be.instanceOf(CompetenceEvaluationAssessment);
      });
    });

    describe('when assessment is type PREVIEW', function () {
      it('should return a PreviewAssessment', function () {
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.PREVIEW });

        const dto = AssessmentDtoFactory.toDto(assessment);

        expect(dto).to.be.instanceOf(PreviewAssessment);
      });
    });

    describe('when assessment is type unknown', function () {
      it('should throw an error', function () {
        const assessment = domainBuilder.buildAssessment({ type: 'unknown' });

        const error = catchErrSync(AssessmentDtoFactory.toDto)(assessment);
        expect(error).to.be.instanceOf(Error);
      });
    });
  });
});
