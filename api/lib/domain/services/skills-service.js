const skillsRespository = require('../../infrastructure/repositories/skill-repository');

module.exports = {

  saveAssessmentSkills(assessmentId, validatedSkills, failedSkills) {
    const formattedValitedSkills = _formatValitedSkills(assessmentId, validatedSkills);
    const formattedFailedSkills = _formatFailedSkills(assessmentId, failedSkills);
    const formattedSkills = [].concat(formattedValitedSkills, formattedFailedSkills);
    return skillsRespository.save(formattedSkills);
  }
};

function _formatValitedSkills(assessmentId, skills) {
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
