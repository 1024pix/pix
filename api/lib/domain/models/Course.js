const _ = require('lodash');
class Course {

  constructor(model = {}) {
    // properties
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.imageUrl = model.imageUrl;
    this.isAdaptive = model.isAdaptive;
    this.type = model.type;

    // relationships
    this.competences = model.competences;
    this.challenges = model.challenges || [];
    this.assessment = model.assessment;

    // transformed
    this.nbChallenges = this.challenges.length;
  }

  addCompetenceSkills(competenceSkills) {
    this.competenceSkills = competenceSkills;
  }

  getTubes(listSkills) {
    const tubes = {};

    listSkills.forEach(skill => {
      const tubeName = skill.tubeName;

      if(!tubes[tubeName]) tubes[tubeName] = [];

      if(!_.find(tubes[tubeName], skill)) tubes[tubeName].push(skill);
    });

    Object.keys(tubes).forEach(tubeName =>  {
      tubes[tubeName] = _.sortBy(tubes[tubeName], ['difficulty']);
    });
    return tubes;
  }
}

module.exports = Course;
