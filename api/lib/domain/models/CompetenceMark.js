const Joi = require('joi');
const { validateEntity } = require('../validators/entity-validator.js');

const schema = Joi.object({
  id: Joi.number().integer().optional(),
  level: Joi.number().integer().min(-1).max(8).required(),
  score: Joi.number().integer().min(0).max(64).required(),
  area_code: Joi.required(),
  competence_code: Joi.required(),
  competenceId: Joi.string().optional(),
  assessmentResultId: Joi.number().optional(),
});

class CompetenceMark {
  constructor({ id, area_code, competence_code, competenceId, level, score, assessmentResultId } = {}) {
    this.id = id;
    this.area_code = area_code;
    this.competence_code = competence_code;
    this.competenceId = competenceId;
    this.level = level;
    this.score = score;
    this.assessmentResultId = assessmentResultId;
  }

  validate() {
    validateEntity(schema, this);
  }
}

module.exports = CompetenceMark;
