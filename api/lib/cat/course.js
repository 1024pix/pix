const _ = require('lodash');

class Course {
  constructor(challenges, competenceSkills) {
    this.challenges = challenges;
    this.competenceSkills = competenceSkills;
  }

  get tubes() {
    const tubes = {};

    this.challenges.forEach(challenge => {
      challenge.skills.forEach(skill => {
        const tubeName = skill.tubeName;

        if(!tubes[tubeName]) tubes[tubeName] = [];

        if(!_.find(tubes[tubeName], skill)) tubes[tubeName].push(skill);
      });
    });
    Object.keys(tubes).forEach(tubeName =>  {
      tubes[tubeName] = _.sortBy(tubes[tubeName], ['difficulty']);
    });
    return tubes;
  }

  computePixScoreOfSkills() {
    const pixScoreOfSkills = {};
    const maxDifficulty = 8;
    const numberOfSkillsByDifficulty = [];

    for (let levelDifficulty = 0; levelDifficulty < maxDifficulty; levelDifficulty++) {
      numberOfSkillsByDifficulty[levelDifficulty] = _.filter(this.competenceSkills, skill => skill.difficulty === levelDifficulty).length;
    }
    this.competenceSkills.forEach(skill => {
      pixScoreOfSkills[skill.name] = Math.min(4, 8 / numberOfSkillsByDifficulty[skill.difficulty]);
    });
    return pixScoreOfSkills;
  }
}

module.exports = Course;

