const Joi = require('joi');
const { ValidationError } = require('../errors');

const schemaValidateCompetenceMark = Joi.object().keys({
  id: Joi.number().optional(),
  level: Joi.number().min(-1).max(5).required(),
  score: Joi.number().min(0).max(64).required(),
  area_code: Joi.required(),
  competence_code: Joi.required(),
  assessmentResultId:  Joi.number().optional()
});

class CompetenceMark {
  constructor(model) {
    Object.assign(this, model);
  }

  validate() {
    const result = Joi.validate(this, schemaValidateCompetenceMark);
    if(result.error === null) {
      return Promise.resolve();
    } else {
      return Promise.reject(new ValidationError(result.error));
    }
  }
}

module.exports = CompetenceMark;
