const _ = require('lodash');

class Course {
  constructor(challenges, competenceSkills) {
    this.challenges = challenges;
    this.competenceSkills = competenceSkills;
  }

  get tubes() {
    const tubes = {};
    this.challenges.forEach(challenge => {
      // FIXME: TO REFACTOR.
      challenge.skills.forEach(skill => {
        const tubeName = skill.tubeName;
        if(tubes[tubeName]) {

          const countOfskillsInTubeWithSameDifficulty = _(tubes[tubeName])
            .filter((skillInTube) => skillInTube.difficulty === skill.difficulty)
            .size();

          if(countOfskillsInTubeWithSameDifficulty === 0) {
            tubes[tubeName].push(skill);
          }

        } else {
          tubes[tubeName] = [skill];
        }
      });
    });
    Object.keys(tubes).forEach(tubeName => tubes[tubeName].sort((s1, s2) => s1.difficulty - s2.difficulty));
    return tubes;
  }

  computePixScoreOfSkills() {
    const pixScoreOfSkills = {};
    const numberOfSkillsOfDifficulty = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    this.competenceSkills.forEach(skill => {
      numberOfSkillsOfDifficulty[skill.difficulty]++;
    });
    this.competenceSkills.forEach(skill => {
      pixScoreOfSkills[skill.name] = Math.min(4, 8 / numberOfSkillsOfDifficulty[skill.difficulty]);
    });
    return pixScoreOfSkills;
  }
}

module.exports = Course;
