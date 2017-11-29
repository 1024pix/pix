const Skill = require('../../cat/skill');
const Challenge = require('../../cat/challenge');
const Course = require('../../cat/course');
const Answer = require('../../cat/answer');
const Assessment = require('../../cat/assessment');

function getAdaptedAssessment(answersPix, challengesPix, skills) {
  const challenges = [];
  const challengesById = {};
  const catSkills = {};

  skills.forEach(skill => catSkills[skill.name] = new Skill(skill.name));
  const competenceSkills = new Set(Object.values(catSkills));

  challengesPix.forEach(challengePix => {
    const challengeSkills = [];

    if (challengePix.skills) {

      challengePix.skills.forEach(skill => {
        if (!catSkills.hasOwnProperty(skill.name)) {
          catSkills[skill.name] = new Skill(skill.name);
        }
        challengeSkills.push(catSkills[skill.name]);
      });

      const challenge = new Challenge(challengePix.id, challengePix.status, challengeSkills, challengePix.timer);
      challenges.push(challenge);
      challengesById[challengePix.id] = challenge;
    }
  });

  const course = new Course(challenges, competenceSkills);

  const answers = answersPix.map(answer =>
    new Answer(challengesById[answer.get('challengeId')], answer.get('result'))
  );

  return new Assessment(course, answers);
}

module.exports = {
  getAdaptedAssessment
};
