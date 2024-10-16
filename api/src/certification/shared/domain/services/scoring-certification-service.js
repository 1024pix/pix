import _ from 'lodash';

import * as scoringService from '../../../../evaluation/domain/services/scoring/scoring-service.js';
import {
  AnswerCollectionForScoring,
  CertificationAssessmentScore,
  CertificationContract,
  CertifiedLevel,
  CertifiedScore,
  CompetenceMark,
  ReproducibilityRate,
} from '../../../../shared/domain/models/index.js';

export const isLackOfAnswersForTechnicalReason = ({ certificationCourse, certificationAssessmentScore }) => {
  return certificationCourse.isAbortReasonTechnical() && certificationAssessmentScore.hasInsufficientCorrectAnswers();
};
