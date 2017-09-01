const Skill = require('../../cat/skill');
const Challenge = require('../../cat/challenge');
const Course = require('../../cat/course');
const Answer = require('../../cat/answer');
const Assessment = require('../../cat/assessment');

function getAdaptedAssessment(answersPix, challengesPix) {
  const challenges = [];
  const challengesById = {};

  challengesPix.forEach(challengePix => {
    const skills = [];
    if (challengePix.knowledgeTags) {
      challengePix.knowledgeTags.forEach(skillName => {
        const tubeName = skillName.slice(0, -1);
        const skillDifficulty = parseInt(skillName.slice(-1));
        skills.push(new Skill(tubeName, skillDifficulty));
      });
      const challenge = new Challenge(challengePix.id, challengePix.status, skills);
      challenges.push(challenge);
      challengesById[challengePix.id] = challenge;
    }
  });

  const course = new Course(challenges);

  const answers = answersPix.reduce((accu, answer) => {
    accu.push(new Answer(challengesById[answer.get('challengeId')], answer.get('result')));
    return accu;
  }, []);

  return new Assessment(course, answers);
}

module.exports = {
  getAdaptedAssessment
};
