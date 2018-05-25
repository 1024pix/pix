const Joi = require('joi');
const { ObjectValidationError } = require('../errors');

const schemaValidateCompetenceMark = Joi.object().keys({
  id: Joi.number().optional(),
  level: Joi.number().integer().min(-1).max(5).required(),
  score: Joi.number().integer().min(0).max(64).required(),
  area_code: Joi.required(),
  competence_code: Joi.required(),
  assessmentResultId: Joi.number().optional(),
});

class CompetenceMark {
  constructor({
    id,
    level,
    score,
    area_code,
    competence_code,
    assessmentResultId,
  } = {}) {
    this.id = id;
    this.level = level;
    this.score = score;
    this.area_code = area_code;
    this.competence_code = competence_code;
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
