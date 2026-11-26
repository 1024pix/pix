import { CampaignAssessment } from '../read-models/CampaignAssessment.js';
import { CertificationAssessment } from '../read-models/CertificationAssessment.js';
import { CompetenceEvaluationAssessment } from '../read-models/CompetenceEvaluationAssessment.js';
import { DemoAssessment } from '../read-models/DemoAssessment.js';
import { PreviewAssessment } from '../read-models/PreviewAssessment.js';
import { Assessment } from './Assessment.js';

export class AssessmentDtoFactory {
  static toDto(assessment, globalProgression) {
    switch (assessment.type) {
      case Assessment.types.CAMPAIGN:
        return new CampaignAssessment(assessment, globalProgression);
      case Assessment.types.CERTIFICATION:
        return new CertificationAssessment(assessment);
      case Assessment.types.DEMO:
        return new DemoAssessment(assessment);
      case Assessment.types.COMPETENCE_EVALUATION:
        return new CompetenceEvaluationAssessment(assessment);
      case Assessment.types.PREVIEW:
        return new PreviewAssessment(assessment);
      case Assessment.types.PIX1D_MISSION:
        return assessment;
      default:
        throw new Error('Unknown assessment type.');
    }
  }
}
