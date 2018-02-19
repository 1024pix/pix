const CatSkill = require('../../cat/skill');
const CatChallenge = require('../../cat/challenge');
const CatCourse = require('../../cat/course');
const CatAnswer = require('../../cat/answer');
const CatAssessment = require('../../cat/assessment');

// TODO: Déclencher une erreur quand pas de skill ?

function getAdaptedAssessment(answersPix, challengesPix, skills) {
  const challenges = [];

  challengesPix.forEach(challengePix => {
    if(challengePix.skills) {
      const challengeCatSkills = challengePix.skills.map(skill => new CatSkill(skill.name));
      const challenge = new CatChallenge(challengePix.id, challengePix.status, challengeCatSkills, challengePix.timer);
      challenges.push(challenge);
    }
  });

  const catSkills = skills.map(skill => new CatSkill(skill.name));
  const course = new CatCourse(challenges, catSkills);

  const answers = answersPix.map(answer => {
    const challengeOfTheAnswer = challenges.find((challenge) => challenge.id === answer.get('challengeId'));
    return new CatAnswer(challengeOfTheAnswer, answer.get('result'));
  });

  return new CatAssessment(course, answers);
}

module.exports = {
  getAdaptedAssessment
};
