const _ = require('lodash');

class Course {
  constructor(challenges, competenceSkills) {
    this.challenges = challenges;
    this.competenceSkills = competenceSkills;
  }

  get tubes() {
    const tubes = {};

    this.challenges.forEach((challenge) => {
      challenge.skills.forEach((skill) => {
        const tubeName = skill.tubeName;

        if (!tubes[tubeName]) {
          tubes[tubeName] = [];
        }

        if (!_.find(tubes[tubeName], skill)) {
          tubes[tubeName].push(skill);
        }
      });
    });
    Object.keys(tubes).forEach((tubeName) =>  {
      tubes[tubeName] = _.sortBy(tubes[tubeName], ['difficulty']);
    });
    return tubes;
  }
}

module.exports = Course;
