const _ = require('lodash');
const Tube = require('./Tube');

class Course {

  constructor({
    id,
    // attributes
    description,
    imageUrl,
    name,
    type,
    // includes
    assessment,
    competenceSkills = [],
    tubes = [],
    // references
    challenges = [],
    competences = [],
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.type = type;
    // includes
    this.assessment = assessment;
    this.competenceSkills = competenceSkills;
    this.tubes = tubes;
    // references
    this.challenges = challenges; // Array of Record IDs
    this.competences = competences; // Array of Record IDs
    this.userId = userId;
  }

  get nbChallenges() {
    return this.challenges.length;
  }

  addCompetenceSkills(competenceSkills) {
    this.competenceSkills = competenceSkills;
  }

  findTube(tubeName) {
    return this.tubes.find((tube) => tube.name === tubeName);
  }

  computeTubes(listSkills) {
    const tubes = [];

    listSkills.forEach((skill) => {
      const tubeNameOfSkill = skill.tubeName;

      if (!tubes.find((tube) => tube.name === tubeNameOfSkill)) {
        tubes.push(new Tube({ skills: [skill] }));
      } else {
        const tube = this.findTube(tubeNameOfSkill);
        tube.addSkill(skill);
      }
      this.tubes = tubes;

    });

    tubes.forEach((tube) =>  {
      tube.skills = _.sortBy(tube.skills, ['difficulty']);
    });
    this.tubes = tubes;
    return tubes;
  }
}

module.exports = Course;
