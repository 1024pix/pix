const Joi = require('joi');

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
    const result =Joi.validate(model, schemaValidateCompetenceMark);
    if(result.error === null) {
      this.id = model.id;
      this.level = model.level;
      this.score = model.score;
      this.area_code = model.area_code;
      this.competence_code = model.competence_code;
      this.assessmentResultId = model.assessmentResultId;
    } else {
      throw new Error(result.error);
    }
  }
}

module.exports = CompetenceMark;
