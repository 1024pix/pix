const faker = require('faker');
const AssessmentScore = require('../../../../lib/domain/models/AssessmentScore');

module.exports = function buildAssessmentScore({

  level = faker.random.number(),
  nbPix = faker.random.number(),
  validatedSkills = [],
  failedSkills = [],
  competenceMarks = [],
} = {}) {
  return new AssessmentScore({
    level,
    nbPix,
    validatedSkills,
    failedSkills,
    competenceMarks,
  });
};
