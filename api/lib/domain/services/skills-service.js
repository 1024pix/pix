const skillsRespository = require('../../infrastructure/repositories/skill-repository');

module.exports = {

  saveAssessmentSkills(assessmentId, validatedSkills, failedSkills) {
    const formattedValidatedSkills = _formatValidatedSkills(assessmentId, validatedSkills);
    const formattedFailedSkills = _formatFailedSkills(assessmentId, failedSkills);
    const formattedSkills = [].concat(formattedValidatedSkills, formattedFailedSkills);
    return skillsRespository.save(formattedSkills);
  }
};

function _formatValidatedSkills(assessmentId, skills) {
  return [...skills].reduce((acc, skill) => {
    acc.push({
      assessmentId,
      name: skill.name,
      status: 'ok'
    });
    return acc;
  }, []);
}

function _formatFailedSkills(assessmentId, skills) {
  return [...skills].reduce((acc, skill) => {
    acc.push({
      assessmentId,
      name: skill.name,
      status: 'ko'
    });
    return acc;
  }, []);
}
