const faker = require('faker');
const CertificationAssessmentScore = require('../../../../lib/domain/models/CertificationAssessmentScore');

module.exports = function buildCertificationAssessmentScore({

  level = faker.random.number(),
  nbPix = faker.random.number(),
  validatedSkills = [],
  failedSkills = [],
  competenceMarks = [],
} = {}) {
  return new CertificationAssessmentScore({
    level,
    nbPix,
    validatedSkills,
    failedSkills,
    competenceMarks,
  });
};
