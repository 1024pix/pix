const Skill = require('../../cat/skill');
const Challenge = require('../../cat/challenge');
const Course = require('../../cat/course');
const Answer = require('../../cat/answer');
const Assessment = require('../../cat/assessment');

function getAdaptedAssessment(coursePix, answersPix, challengesPix, skillNames) {
  const challenges = [];
  const challengesById = {};
  const skills = {};

  skillNames.forEach(skillName => skills[skillName] = new Skill(skillName));
  const competenceSkills = new Set(Object.values(skills));

  challengesPix.forEach(challengePix => {
    const challengeSkills = [];
    if (challengePix.knowledgeTags) {
      challengePix.knowledgeTags.forEach(skillName => {
        if (!skills.hasOwnProperty(skillName)) {
          skills[skillName] = new Skill(skillName);
        }
        challengeSkills.push(skills[skillName]);
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
