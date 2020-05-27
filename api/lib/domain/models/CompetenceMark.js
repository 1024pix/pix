const Joi = require('@hapi/joi');
const { ObjectValidationError } = require('../errors');

const schemaValidateCompetenceMark = Joi.object({
  id: Joi.number().integer().optional(),
  level: Joi.number().integer().min(-1).max(8).required(),
  score: Joi.number().integer().min(0).max(64).required(),
  area_code: Joi.required(),
  competence_code: Joi.required(),
  competenceId: Joi.string().optional(),
  assessmentResultId: Joi.number().optional(),
});

class CompetenceMark {
  constructor({
    id,
    // attributes
    area_code,
    competence_code,
    competenceId,
    level,
    score,
    // includes
    // references
    assessmentResultId,
  } = {}) {
    this.id = id;
    // attributes
    this.area_code = area_code;
    this.competence_code = competence_code;
    this.competenceId = competenceId;
    this.level = level;
    this.score = score;
    // includes
    // references
    this.assessmentResultId = assessmentResultId;
  }

  validate() {
    const { error } = schemaValidateCompetenceMark.validate(this);
    if (error) {
      return Promise.reject(new ObjectValidationError(error));
    } else {
      return Promise.resolve();
    }
  }
}

module.exports = CompetenceMark;
