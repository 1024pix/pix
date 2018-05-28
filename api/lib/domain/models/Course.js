const _ = require('lodash');
const Tube = require('./Tube');

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

  findTube(tubeName) {
    return this.tubes.find(tube => tube.name === tubeName);
  }

  computeTubes(listSkills) {
    const tubes = [];

    listSkills.forEach(skill => {
      const tubeNameOfSkill = skill.tubeName;

      if(!tubes.find((tube) => tube.name === tubeNameOfSkill)) {
        tubes.push(new Tube({ skills: [skill] }));
      } else {
        const tube = this.findTube(tubeNameOfSkill);
        tube.addSkill(skill);
      }
      this.tubes = tubes;

    });

    tubes.forEach(tube =>  {
      tube.skills = _.sortBy(tube.skills, ['difficulty']);
    });
    this.tubes = tubes;
    return tubes;
  }
}

module.exports = Course;
