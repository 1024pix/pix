const Joi = require('joi');
const { ObjectValidationError } = require('../errors');

const schemaValidateCompetenceMark = Joi.object().keys({
  id: Joi.number().optional(),
  level: Joi.number().integer().min(-1).max(8).required(),
  score: Joi.number().integer().min(0).max(64).required(),
  area_code: Joi.required(),
  competence_code: Joi.required(),
  assessmentResultId: Joi.number().optional(),
});

class CompetenceMark {
  constructor({
    id,
    // attributes
    area_code,
    competence_code,
    level,
    score,
    // embedded
    // relations
    assessmentResultId,
  } = {}) {
    this.id = id;
    // attributes
    this.area_code = area_code;
    this.competence_code = competence_code;
    this.level = level;
    this.score = score;
    // embedded
    // relations
    this.assessmentResultId = assessmentResultId;
  }

  validate() {
    const result = Joi.validate(this, schemaValidateCompetenceMark);
    if (result.error === null) {
      return Promise.resolve();
    } else {
      return Promise.reject(new ObjectValidationError(result.error));
    }
  }
}

module.exports = CompetenceMark;
