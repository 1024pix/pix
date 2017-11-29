const Skill = require('../../cat/skill');
const Challenge = require('../../cat/challenge');
const Course = require('../../cat/course');
const Answer = require('../../cat/answer');
const Assessment = require('../../cat/assessment');

// TODO: Déclencher une erreur quand pas de skill ?

function getAdaptedAssessment(answersPix, challengesPix, skills) {
  const challenges = [];
  const challengesById = {};
  const catSkills = {};

  challengesPix.forEach(challengePix => {
    if (challengePix.skills) {
      const challengeCatSkills = challengePix.skills.map(skill => new Skill(skill.name));
      const challenge = new Challenge(challengePix.id, challengePix.status, challengeCatSkills, challengePix.timer);

      challenges.push(challenge);
      challengesById[challengePix.id] = challenge;
    }
  });

  skills.forEach(skill => catSkills[skill.name] = new Skill(skill.name));
  const competenceSkills = new Set(Object.values(catSkills));

  const course = new Course(challenges, competenceSkills);

  const answers = answersPix.map(answer =>
    new Answer(challengesById[answer.get('challengeId')], answer.get('result'))
  );

  return new Assessment(course, answers);
}

module.exports = {
  getAdaptedAssessment
};
