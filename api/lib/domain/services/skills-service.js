const skillsRespository = require('../../infrastructure/repositories/skill-repository');

module.exports = {
  saveAssessmentSkills(skills) {
    if (!skills) {
      return Promise.resolve(null);
    }
    const formattedValitedSkills = _formatValitedSkills(skills.assessmentId, skills.validatedSkills);
    const formattedFailedSkills = _formatFailedSkills(skills.assessmentId, skills.failedSkills);

    const formattedSkills = [].concat(formattedValitedSkills, formattedFailedSkills);

    return skillsRespository.db.save(formattedSkills);
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
