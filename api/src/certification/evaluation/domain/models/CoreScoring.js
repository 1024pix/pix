import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CertificationAssessmentScoreV3 } from '../../../scoring/domain/models/CertificationAssessmentScoreV3.js';

export class CoreScoring {
  static #schema = Joi.object({
    certificationAssessmentScore: Joi.object().instance(CertificationAssessmentScoreV3).required(),
    assessmentResult: Joi.object().instance(AssessmentResult).required(),
  });

  constructor(certificationAssessmentScore, assessmentResult) {
    this.certificationAssessmentScore = certificationAssessmentScore;
    this.assessmentResult = assessmentResult;
    this.#validate();
  }

  #validate() {
    const { error } = CoreScoring.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
